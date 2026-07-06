import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn("rounded-xl border bg-card p-8 flex flex-col items-start gap-2", className)} data-testid="empty-state">
      <div className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="text-base font-semibold mt-2">{title}</div>
      {description && <div className="text-sm text-muted-foreground max-w-lg">{description}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
export default EmptyState;
