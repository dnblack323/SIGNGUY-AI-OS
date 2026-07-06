import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { extractError } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import StatusPill from "@/components/common/StatusPill";
import MoneyInput from "@/components/forms/MoneyInput";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { centsToDollarsString } from "@/lib/format";
import { ArrowLeft, Plus, Trash2, Wrench, Receipt } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

function ItemsTable({ items, onAdd, onUpdate, onDelete, canWrite }) {
  const [newDesc, setNewDesc] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);
  const [busy, setBusy] = useState(false);
  const total = items.reduce((s, it) => s + Number(it.quantity || 1) * Number(it.unit_price_cents || 0), 0);

  async function submitNew(e) {
    e.preventDefault();
    if (!newDesc) return;
    setBusy(true);
    await onAdd({ description: newDesc, quantity: Number(newQty) || 1, unit_price_cents: Number(newPrice) || 0 });
    setBusy(false);
    setNewDesc(""); setNewQty(1); setNewPrice(0);
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="grid grid-cols-[1fr_80px_140px_140px_40px] gap-2 px-3 py-2 border-b text-xs font-medium text-muted-foreground">
        <div>Description</div><div className="text-right">Qty</div><div className="text-right">Unit</div><div className="text-right">Line total</div><div></div>
      </div>
      <div className="divide-y">
        {items.map((it) => (
          <ItemRow key={it.id} it={it} onUpdate={(patch) => onUpdate(it.id, patch)} onDelete={() => onDelete(it.id)} canWrite={canWrite} />
        ))}
        {items.length === 0 && <div className="px-3 py-6 text-sm text-muted-foreground">No items yet.</div>}
      </div>
      {canWrite && (
        <form onSubmit={submitNew} className="grid grid-cols-[1fr_80px_140px_120px_40px] gap-2 p-3 border-t items-center" data-testid="order-items-add-row">
          <Input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} data-testid="order-item-new-description" />
          <Input type="number" min="1" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="text-right" data-testid="order-item-new-quantity" />
          <MoneyInput value={newPrice} onChange={setNewPrice} testId="order-item-new-price" />
          <Button type="submit" disabled={busy || !newDesc} data-testid="order-item-add-button"><Plus className="size-4 mr-1" />Add</Button>
          <div />
        </form>
      )}
      <div className="flex items-center justify-end gap-4 px-3 py-3 border-t bg-muted/20">
        <div className="text-sm text-muted-foreground">Subtotal</div>
        <div className="text-base font-semibold tabular-nums" data-testid="order-items-subtotal">{centsToDollarsString(total)}</div>
      </div>
    </div>
  );
}

function ItemRow({ it, onUpdate, onDelete, canWrite }) {
  const [desc, setDesc] = useState(it.description);
  const [qty, setQty] = useState(it.quantity);
  const [price, setPrice] = useState(it.unit_price_cents);
  const line = Number(qty || 1) * Number(price || 0);

  function commit() {
    const patch = {};
    if (desc !== it.description) patch.description = desc;
    if (Number(qty) !== it.quantity) patch.quantity = Number(qty);
    if (Number(price) !== it.unit_price_cents) patch.unit_price_cents = Number(price);
    if (Object.keys(patch).length) onUpdate(patch);
  }

  return (
    <div className="grid grid-cols-[1fr_80px_140px_140px_40px] gap-2 items-center px-3 py-2" data-testid={`order-item-row-${it.id}`}>
      <Input value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={commit} disabled={!canWrite} />
      <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} onBlur={commit} disabled={!canWrite} className="text-right" />
      <MoneyInput value={price} onChange={setPrice} disabled={!canWrite} />
      <div className="text-right tabular-nums text-sm">{centsToDollarsString(line)}</div>
      {canWrite ? (
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Remove item" data-testid={`order-item-delete-${it.id}`}><Trash2 className="size-4 text-muted-foreground" /></Button>
      ) : <div />}
      {canWrite && (desc !== it.description || Number(qty) !== it.quantity || Number(price) !== it.unit_price_cents) && (
        <div className="col-span-5"><Button size="sm" onClick={commit} data-testid={`order-item-save-${it.id}`}>Save changes</Button></div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { hasPerm } = useAuth();
  const canWrite = hasPerm("order:write");

  const { data } = useQuery({ queryKey: ["order", id], queryFn: async () => (await api.get(`/orders/${id}`)).data });
  const { data: audit } = useQuery({ queryKey: ["audit-order", id], queryFn: async () => (await api.get(`/audit`, { params: { entity_type: "order", entity_id: id } })).data, enabled: !!id });
  const { data: customer } = useQuery({ queryKey: ["customer", data?.order?.customer_id], queryFn: async () => (await api.get(`/customers/${data.order.customer_id}`)).data, enabled: !!data?.order?.customer_id });

  const [form, setForm] = useState({});
  const order = data?.order;
  const items = data?.items || [];

  const patch = useMutation({
    mutationFn: async (payload) => (await api.patch(`/orders/${id}`, payload)).data,
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["order", id] }); qc.invalidateQueries({ queryKey: ["audit-order", id] }); setForm({}); },
    onError: (e) => toast.error(extractError(e)),
  });

  const setStatus = useMutation({
    mutationFn: async (status) => (await api.post(`/orders/${id}/status`, { status })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["order", id] }); qc.invalidateQueries({ queryKey: ["audit-order", id] }); },
    onError: (e) => toast.error(extractError(e)),
  });

  const addItem = useMutation({
    mutationFn: async (payload) => (await api.post(`/orders/${id}/items`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order", id] }),
    onError: (e) => toast.error(extractError(e)),
  });
  const updateItem = useMutation({
    mutationFn: async ({ itemId, payload }) => (await api.patch(`/orders/${id}/items/${itemId}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order", id] }),
    onError: (e) => toast.error(extractError(e)),
  });
  const deleteItem = useMutation({
    mutationFn: async (itemId) => (await api.delete(`/orders/${id}/items/${itemId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order", id] }),
    onError: (e) => toast.error(extractError(e)),
  });

  const createWO = useMutation({
    mutationFn: async () => (await api.post(`/work-orders`, { order_id: id })).data,
    onSuccess: (wo) => { toast.success(`Work order W-${wo.number} created`); navigate(`/work-orders/${wo.id}`); },
    onError: (e) => toast.error(extractError(e)),
  });

  const createInvoice = useMutation({
    mutationFn: async () => (await api.post(`/invoices`, {
      order_id: id, title: order?.job_name || "Invoice",
      total_cents: items.reduce((s, it) => s + Number(it.quantity||1)*Number(it.unit_price_cents||0), 0),
    })).data,
    onSuccess: (res) => { toast.success(res.already_exists ? "Invoice already exists" : `Invoice I-${res.invoice.number} created`); navigate(`/invoices/${res.invoice.id}`); },
    onError: (e) => toast.error(extractError(e)),
  });

  if (!order) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const edit = { ...order, ...form };

  return (
    <div className="space-y-4" data-testid="order-detail-page">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon"><Link to="/orders"><ArrowLeft className="size-4" /></Link></Button>
        <PageHeader
          title={<span><span className="mono text-muted-foreground text-lg mr-2">O-{order.number}</span>{order.job_name}</span>}
          subtitle={<span>Customer: <Link className="link-underline" to={`/customers/${order.customer_id}`}>{customer?.name || "…"}</Link>{order.quote_id && <> · from Quote <Link className="link-underline" to={`/quotes/${order.quote_id}`}>Q-…</Link></>}</span>}
          actions={canWrite && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => createWO.mutate()} disabled={createWO.isPending} data-testid="order-create-workorder-button"><Wrench className="size-4 mr-1" />New work order</Button>
              <Button size="sm" onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending || items.length === 0} data-testid="order-create-invoice-button"><Receipt className="size-4 mr-1" />Create invoice</Button>
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Tabs defaultValue="items" data-testid="detail-tabs">
          <TabsList>
            <TabsTrigger value="items" data-testid="detail-tab-items">Items</TabsTrigger>
            <TabsTrigger value="details" data-testid="detail-tab-details">Details</TabsTrigger>
            <TabsTrigger value="activity" data-testid="detail-tab-activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="items">
            <ItemsTable
              items={items}
              canWrite={canWrite}
              onAdd={(p) => addItem.mutateAsync(p)}
              onUpdate={(itemId, payload) => updateItem.mutate({ itemId, payload })}
              onDelete={(itemId) => deleteItem.mutate(itemId)}
            />
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-1.5"><Label>Job name</Label><Input value={edit.job_name || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, job_name: e.target.value }))} /></div>
                <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={4} value={edit.notes || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                {canWrite && Object.keys(form).length > 0 && <Button onClick={() => patch.mutate(form)}>Save</Button>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity"><AuditTimeline events={audit?.items || []} /></TabsContent>
        </Tabs>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatusPill kind="order" value={order.status} />
              {canWrite && (
                <div className="grid grid-cols-2 gap-2">
                  {["draft","confirmed","in_production","completed","cancelled"].filter((s) => s !== order.status).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => setStatus.mutate(s)} data-testid={`order-set-status-${s}`}>
                      <span className="capitalize">{s.replace("_"," ")}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Totals</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Items</span><span className="tabular-nums">{items.length}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-medium">{centsToDollarsString(items.reduce((s, it) => s + Number(it.quantity||1)*Number(it.unit_price_cents||0), 0))}</span></div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
