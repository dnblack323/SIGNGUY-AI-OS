import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { extractError } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

function NewUserDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "staff", password: "" });
  const [busy, setBusy] = useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await api.post("/users", form); toast.success("User created"); setOpen(false); onCreated?.(); setForm({ email: "", full_name: "", role: "staff", password: "" }); }
    catch (err) { toast.error(extractError(err)); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" data-testid="new-user-button"><Plus className="size-4 mr-1" />Add user</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader><DialogTitle>Add teammate</DialogTitle><DialogDescription>They'll be able to sign in immediately.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={upd("full_name")} required data-testid="new-user-name-input" /></div>
          <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={upd("email")} required data-testid="new-user-email-input" /></div>
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger data-testid="new-user-role-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Temporary password (min 8)</Label><Input type="password" value={form.password} onChange={upd("password")} minLength={8} required data-testid="new-user-password-input" /></div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} data-testid="new-user-submit-button">{busy ? "Saving…" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const { user, tenant, permissions, hasPerm } = useAuth();
  const qc = useQueryClient();
  const canUserAdmin = hasPerm("user:read");
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get("/users")).data, enabled: canUserAdmin });

  return (
    <div className="space-y-4" data-testid="settings-page">
      <PageHeader title="Settings" subtitle="Your shop and account." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Shop</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{tenant?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Slug</span><span className="mono">{tenant?.slug}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your account</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{user?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Permissions (backend-provided)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.map((p) => <Badge key={p} variant="secondary" className="mono text-[11px]">{p}</Badge>)}
            </div>
          </CardContent>
        </Card>

        {canUserAdmin && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team</CardTitle>
              {hasPerm("user:write") && <NewUserDialog onCreated={() => qc.invalidateQueries({ queryKey: ["users"] })} />}
            </CardHeader>
            <CardContent>
              <Table data-testid="users-table">
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(users || []).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                      <TableCell><span className={u.is_active ? "text-emerald-700" : "text-rose-700"}>{u.is_active ? "Active" : "Disabled"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
