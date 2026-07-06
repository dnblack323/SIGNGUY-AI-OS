import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TableSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import { formatDateTime, relativeTime } from "@/lib/format";
import { Mail } from "lucide-react";

export default function EmailHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["email-history"],
    queryFn: async () => (await api.get("/emails/history", { params: { limit: 200 } })).data,
  });
  const items = data?.items || [];

  return (
    <div className="space-y-4" data-testid="email-history-page">
      <PageHeader title="Email History" subtitle={data?.configured ? "SendGrid is configured." : "SendGrid is not configured. Emails are logged as failed until keys are set."} />
      {isLoading ? <TableSkeleton /> : items.length === 0 ? (
        <EmptyState icon={Mail} title="No emails yet" description="Send your first email from a Quote or Invoice." />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Sent</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((e) => (
                <TableRow key={e.id} data-testid={`email-row-${e.id}`}>
                  <TableCell className="text-sm text-muted-foreground" title={formatDateTime(e.created_at)}>{relativeTime(e.created_at)}</TableCell>
                  <TableCell className="text-sm">{e.to_email}</TableCell>
                  <TableCell className="text-sm max-w-[420px] truncate">{e.subject}</TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{String(e.template || "").replace("_"," ")}</TableCell>
                  <TableCell><StatusPill kind="email" value={e.status} />{e.error_message && <span className="ml-2 text-xs text-muted-foreground">{e.error_message}</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
