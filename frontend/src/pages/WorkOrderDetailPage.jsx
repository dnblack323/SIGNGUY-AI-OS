import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { extractError } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import StatusPill from "@/components/common/StatusPill";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { centsToDollarsString } from "@/lib/format";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { hasPerm } = useAuth();
  const canWrite = hasPerm("work_order:write");

  const { data: w } = useQuery({ queryKey: ["work-order", id], queryFn: async () => (await api.get(`/work-orders/${id}`)).data });
  const { data: audit } = useQuery({ queryKey: ["audit-wo", id], queryFn: async () => (await api.get(`/audit`, { params: { entity_type: "work_order", entity_id: id } })).data, enabled: !!id });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get(`/users`)).data, enabled: canWrite });

  const [form, setForm] = useState({});
  const edit = { ...w, ...form };

  const save = useMutation({
    mutationFn: async (payload) => (await api.patch(`/work-orders/${id}`, payload)).data,
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["work-order", id] }); qc.invalidateQueries({ queryKey: ["audit-wo", id] }); setForm({}); },
    onError: (e) => toast.error(extractError(e)),
  });

  const setProd = useMutation({
    mutationFn: async (production_status) => (await api.post(`/work-orders/${id}/production-status`, { production_status })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["work-order", id] }); qc.invalidateQueries({ queryKey: ["audit-wo", id] }); },
    onError: (e) => toast.error(extractError(e)),
  });

  if (!w) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4" data-testid="work-order-detail-page">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon"><Link to="/work-orders"><ArrowLeft className="size-4" /></Link></Button>
        <PageHeader
          title={<span><span className="mono text-muted-foreground text-lg mr-2">W-{w.number}</span>Work Order</span>}
          subtitle={<span>Order: <Link className="link-underline" to={`/orders/${w.order_id}`}>Open order</Link></span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Tabs defaultValue="items" data-testid="detail-tabs">
          <TabsList>
            <TabsTrigger value="items" data-testid="detail-tab-items">Items</TabsTrigger>
            <TabsTrigger value="details" data-testid="detail-tab-details">Details</TabsTrigger>
            <TabsTrigger value="activity" data-testid="detail-tab-activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="items">
            <Card>
              <CardHeader><CardTitle>Items snapshot (at creation)</CardTitle></CardHeader>
              <CardContent>
                {(!w.items_snapshot || w.items_snapshot.length === 0) ? (
                  <div className="text-sm text-muted-foreground">No items were on the order at creation.</div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-[1fr_80px_140px_140px] gap-2 px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                      <div>Description</div><div className="text-right">Qty</div><div className="text-right">Unit</div><div className="text-right">Line total</div>
                    </div>
                    <div className="divide-y">
                      {w.items_snapshot.map((it, i) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_140px_140px] gap-2 px-3 py-2 items-center text-sm">
                          <div>{it.description}</div>
                          <div className="text-right tabular-nums">{it.quantity}</div>
                          <div className="text-right tabular-nums">{centsToDollarsString(it.unit_price_cents)}</div>
                          <div className="text-right tabular-nums">{centsToDollarsString((it.quantity || 1) * (it.unit_price_cents || 0))}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Production notes</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-1.5"><Label>Production instructions</Label><Textarea rows={4} value={edit.production_instructions || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, production_instructions: e.target.value }))} data-testid="work-order-instructions-input" /></div>
                <div className="grid gap-1.5"><Label>Internal notes</Label><Textarea rows={3} value={edit.internal_notes || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, internal_notes: e.target.value }))} /></div>
                {canWrite && users?.length > 0 && (
                  <div className="grid gap-1.5">
                    <Label>Assigned to</Label>
                    <Select value={edit.assigned_to || ""} onValueChange={(v) => setForm((f) => ({ ...f, assigned_to: v }))}>
                      <SelectTrigger data-testid="work-order-assignee-select"><SelectValue placeholder="Choose staff" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>None</SelectItem>
                        {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {canWrite && Object.keys(form).length > 0 && <Button onClick={() => save.mutate(form)}><Save className="size-4 mr-1" />Save</Button>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity"><AuditTimeline events={audit?.items || []} /></TabsContent>
        </Tabs>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Production status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatusPill kind="production" value={w.production_status} />
              {canWrite && (
                <div className="grid grid-cols-2 gap-2">
                  {["not_started","in_progress","on_hold","completed"].filter((s) => s !== w.production_status).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => setProd.mutate(s)} data-testid={`work-order-set-status-${s}`}>
                      <span className="capitalize">{s.replace("_"," ")}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
