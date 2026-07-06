import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { extractError } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

const TEMPLATE_LABELS = {
  quote_sent: "Quote sent",
  invoice_sent: "Invoice sent",
  invoice_reminder: "Invoice reminder",
  document_sent: "Document sent",
  general: "General message",
};

export default function ComposeEmailDialog({
  trigger,
  toEmail: initialTo,
  customerId,
  relatedType = "general",
  relatedId,
  defaultTemplate = "general",
  suggestedSubject = "",
  suggestedBody = "",
}) {
  const [open, setOpen] = useState(false);
  const [toEmail, setToEmail] = useState(initialTo || "");
  const [subject, setSubject] = useState(suggestedSubject);
  const [body, setBody] = useState(suggestedBody);
  const [template, setTemplate] = useState(defaultTemplate);
  const [busy, setBusy] = useState(false);

  const { data: cfg } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => (await api.get("/emails/templates")).data,
    enabled: open,
  });

  const configured = cfg?.configured;

  async function send() {
    setBusy(true);
    const idempo = crypto.randomUUID();
    try {
      const { data } = await api.post("/emails/send", {
        to_email: toEmail, subject, body, template,
        customer_id: customerId, related_type: relatedType, related_id: relatedId,
        attachment_file_ids: [],
      }, { headers: { "Idempotency-Key": idempo } });
      if (data.ok) toast.success("Email sent");
      else toast.warning(`Email logged as ${data.email.status}: ${data.email.error_message || "see history"}`);
      setOpen(false);
    } catch (err) { toast.error(extractError(err)); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setToEmail(initialTo || ""); setSubject(suggestedSubject); setBody(suggestedBody); setTemplate(defaultTemplate); } }}>
      {trigger ? <span onClick={() => setOpen(true)}>{trigger}</span> : null}
      <DialogContent className="sm:max-w-[600px]" data-testid="compose-email-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="size-4" />Compose email</DialogTitle>
          <DialogDescription>
            {configured ? "Emails send via SendGrid." : "SendGrid not configured; email will be logged as failed until keys are added."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger data-testid="compose-email-template-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>To</Label><Input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} data-testid="compose-email-to-input" /></div>
          <div className="grid gap-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} data-testid="compose-email-subject-input" /></div>
          <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} data-testid="compose-email-body-textarea" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} disabled={busy || !toEmail || !subject || !body} data-testid="compose-email-send-button">
            {busy && <Loader2 className="size-4 mr-2 animate-spin" />}Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
