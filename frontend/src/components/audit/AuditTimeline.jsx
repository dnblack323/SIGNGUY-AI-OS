import { relativeTime } from "@/lib/format";
import { UserRound } from "lucide-react";

export function AuditTimeline({ events, emptyText = "No activity yet.", testId = "audit-timeline" }) {
  if (!events?.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground" data-testid={testId}>
        {emptyText}
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-card" data-testid={testId}>
      <ul className="divide-y">
        {events.map((e) => (
          <li key={e.id} className="p-3 flex gap-3" data-testid="audit-timeline-item">
            <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{e.summary}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <UserRound className="size-3" /> {e.actor_email} · <span className="mono">{e.action}</span> · {relativeTime(e.created_at)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default AuditTimeline;
