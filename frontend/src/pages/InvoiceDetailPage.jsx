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
import MoneyInput from "@/components/forms/MoneyInput";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { centsToDollarsString, formatDate } from "@/lib/format";
import { ArrowLeft, Save, Plus, Mail } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import ComposeEmailDialog from "@/components/email/ComposeEmailDialog";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { hasPerm } = useAuth();

  const { data } = useQuery({ queryKey: ["invoice", id], queryFn: async () => (await api.get(`/invoices/${id}`)).data });
  const { data: audit } = useQuery({ queryKey: ["audit-invoice", id], queryFn: async () => (await api.get(`/audit`, { params: { entity_type: "invoice", entity_id: id } })).data, enabled: !!id });
  const { data: customer } = useQuery({ queryKey: ["customer", data?.invoice?.customer_id], queryFn: async () => (await api.get(`/customers/${data.invoice.customer_id}`)).data, enabled: !!data?.invoice?.customer_id });

  const inv = data?.invoice;
  const payments = data?.payments || [];

  const [form, setForm] = useState({});
  const [newPay, setNewPay] = useState({ amount_cents: 0, method: "cash", paid_on: new Date().toISOString().slice(0,10), reference: "", notes: "" });
  const edit = { ...inv, ...form };

  const patch = useMutation({
    mutationFn: async (payload) => (await api.patch(`/invoices/${id}`, payload)).data,
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["invoice", id] }); setForm({}); qc.invalidateQueries({ queryKey: ["audit-invoice", id] }); },
    onError: (e) => toast.error(extractError(e)),
  });
  const setStatus = useMutation({
    mutationFn: async (status) => (await api.post(`/invoices/${id}/status`, { status })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoice", id] }); qc.invalidateQueries({ queryKey: ["audit-invoice", id] }); },
    onError: (e) => toast.error(extractError(e)),
  });
  const addPay = useMutation({
    mutationFn: async () => (await api.post(`/invoices/${id}/payments`, newPay, { headers: { "Idempotency-Key": crypto.randomUUID() } })).data,
    onSuccess: () => {
      toast.success("Payment recorded");
      setNewPay({ amount_cents: 0, method: "cash", paid_on: new Date().toISOString().slice(0,10), reference: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["audit-invoice", id] });
    },
    onError: (e) => toast.error(extractError(e)),
  });

  if (!inv) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const canWrite = hasPerm("invoice:write") && !(["paid","void"].includes(inv.status));
  const canPay = hasPerm("payment:write") && inv.status !== "void";

  return (
    <div className="space-y-4" data-testid="invoice-detail-page">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon"><Link to="/invoices"><ArrowLeft className="size-4" /></Link></Button>
        <PageHeader
          title={<span><span className="mono text-muted-foreground text-lg mr-2">I-{inv.number}</span>{inv.title}</span>}
          subtitle={<span>Order: <Link className="link-underline" to={`/orders/${inv.order_id}`}>Open order</Link>{customer && <> · Customer: <Link className="link-underline" to={`/customers/${customer.id}`}>{customer.name}</Link></>}</span>}
          actions={hasPerm("email:send") && customer?.email && (
            <ComposeEmailDialog
              defaultTemplate="invoice_sent"
              toEmail={customer.email}
              customerId={customer.id}
              relatedType="invoice"
              relatedId={inv.id}
              suggestedSubject={`Invoice I-${inv.number} — ${inv.title}`}
              suggestedBody={`Hi ${customer.name},\n\nAttached is invoice I-${inv.number}.\nTotal: ${centsToDollarsString(inv.total_cents)}\nBalance due: ${centsToDollarsString(inv.balance_due_cents)}\nDue date: ${inv.due_date || "—"}\n\nThank you for your business.`}
              trigger={<Button variant="outline" size="sm" data-testid="invoice-email-button"><Mail className="size-4 mr-1" />Email invoice</Button>}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <Tabs defaultValue="details" data-testid="detail-tabs">
          <TabsList>
            <TabsTrigger value="details" data-testid="detail-tab-details">Details</TabsTrigger>
            <TabsTrigger value="payments" data-testid="detail-tab-payments">Payments</TabsTrigger>
            <TabsTrigger value="activity" data-testid="detail-tab-activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5"><Label>Title</Label><Input value={edit.title || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} data-testid="invoice-title-input" /></div>
                <div className="grid gap-1.5"><Label>Total</Label><MoneyInput value={edit.total_cents} disabled={!canWrite} onChange={(v) => setForm((f) => ({ ...f, total_cents: v }))} testId="invoice-total-input" /></div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={(edit.due_date || "").slice(0,10)} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
                <div className="md:col-span-2 grid gap-1.5"><Label>Description</Label><Textarea rows={3} value={edit.description || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                <div className="md:col-span-2 grid gap-1.5"><Label>Notes</Label><Textarea rows={2} value={edit.notes || ""} disabled={!canWrite} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                {canWrite && Object.keys(form).length > 0 && <div className="md:col-span-2"><Button onClick={() => patch.mutate(form)} data-testid="invoice-save-button"><Save className="size-4 mr-1" />Save</Button></div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No payments yet.</div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-[1fr_140px_100px_1fr] gap-2 px-3 py-2 border-b text-xs font-medium text-muted-foreground">
                      <div>Date</div><div className="text-right">Amount</div><div>Method</div><div>Reference / notes</div>
                    </div>
                    <div className="divide-y">
                      {payments.map((p) => (
                        <div key={p.id} className="grid grid-cols-[1fr_140px_100px_1fr] gap-2 px-3 py-2 text-sm" data-testid={`payment-row-${p.id}`}>
                          <div>{formatDate(p.paid_on)}</div>
                          <div className="text-right tabular-nums">{centsToDollarsString(p.amount_cents)}</div>
                          <div className="capitalize">{p.method}</div>
                          <div className="text-muted-foreground truncate">{p.reference || p.notes || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {canPay && (
                  <div className="grid gap-2 md:grid-cols-[1fr_180px_180px_140px_auto] items-end" data-testid="add-payment-row">
                    <div className="grid gap-1.5"><Label>Amount</Label><MoneyInput value={newPay.amount_cents} onChange={(v) => setNewPay((p) => ({ ...p, amount_cents: v }))} testId="payment-amount-input" /></div>
                    <div className="grid gap-1.5">
                      <Label>Method</Label>
                      <Select value={newPay.method} onValueChange={(v) => setNewPay((p) => ({ ...p, method: v }))}>
                        <SelectTrigger data-testid="payment-method-select"><SelectValue /></SelectTrigger>
                        <SelectContent>{["cash","check","card","bank_transfer","other"].map((m) => <SelectItem key={m} value={m}><span className="capitalize">{m.replace("_"," ")}</span></SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5"><Label>Paid on</Label><Input type="date" value={newPay.paid_on} onChange={(e) => setNewPay((p) => ({ ...p, paid_on: e.target.value }))} data-testid="payment-paid-on-input" /></div>
                    <div className="grid gap-1.5"><Label>Reference</Label><Input value={newPay.reference} onChange={(e) => setNewPay((p) => ({ ...p, reference: e.target.value }))} placeholder="Check #, txn id…" /></div>
                    <Button onClick={() => addPay.mutate()} disabled={addPay.isPending || !newPay.amount_cents} data-testid="add-payment-button"><Plus className="size-4 mr-1" />Add payment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity"><AuditTimeline events={audit?.items || []} /></TabsContent>
        </Tabs>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <StatusPill kind="invoice" value={inv.status} />
              {hasPerm("invoice:write") && (
                <div className="grid grid-cols-2 gap-2">
                  {["draft","sent","viewed","overdue","void"].filter((s) => s !== inv.status).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => setStatus.mutate(s)} data-testid={`invoice-set-status-${s}`}>
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
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Invoice total</span><span className="tabular-nums font-medium">{centsToDollarsString(inv.total_cents)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Paid</span><span className="tabular-nums">{centsToDollarsString(inv.paid_cents || 0)}</span></div>
              <div className="flex items-center justify-between font-semibold"><span>Balance due</span><span className="tabular-nums" data-testid="invoice-balance-due">{centsToDollarsString(inv.balance_due_cents)}</span></div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
