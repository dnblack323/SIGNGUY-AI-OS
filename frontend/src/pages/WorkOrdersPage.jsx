import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TableSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import StatusPill from "@/components/common/StatusPill";
import { Wrench } from "lucide-react";
import { relativeTime } from "@/lib/format";
import { useState } from "react";

export default function WorkOrdersPage() {
  const [status, setStatus] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["work-orders", status],
    queryFn: async () => (await api.get("/work-orders", { params: { production_status: status === "all" ? undefined : status, limit: 100 } })).data,
  });
  const items = data?.items || [];
  return (
    <div className="space-y-4" data-testid="work-orders-page">
      <PageHeader title="Work Orders" subtitle="Production floor view." />
      <div className="flex flex-wrap gap-2">
        {["all","not_started","in_progress","on_hold","completed"].map((s) => (
          <Button key={s} variant={status === s ? "default" : "outline"} size="sm" onClick={() => setStatus(s)} data-testid={`work-orders-filter-${s}`}>
            <span className="capitalize">{s.replace("_", " ")}</span>
          </Button>
        ))}
      </div>
      {isLoading ? <TableSkeleton /> : items.length === 0 ? (
        <EmptyState icon={Wrench} title="No work orders yet" description="Create a work order from an Order." />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table data-testid="work-orders-table">
            <TableHeader><TableRow>
              <TableHead>#</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id} className="hover:bg-muted/40" data-testid={`work-order-row-${w.id}`}>
                  <TableCell className="mono text-xs">W-{w.number}</TableCell>
                  <TableCell><Link className="font-medium hover:underline" to={`/work-orders/${w.id}`}>Order {w.order_id.slice(0, 8)}…</Link></TableCell>
                  <TableCell><StatusPill kind="production" value={w.production_status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{(w.items_snapshot || []).length}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{relativeTime(w.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
