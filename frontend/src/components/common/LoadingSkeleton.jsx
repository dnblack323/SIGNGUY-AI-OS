import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden" data-testid="loading-skeleton">
      <div className="h-10 border-b bg-muted/40" />
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 px-3 flex items-center gap-4">
            <Skeleton className="h-4 w-16 animate-soft-pulse" />
            <Skeleton className="h-4 flex-1 animate-soft-pulse" />
            <Skeleton className="h-4 w-24 animate-soft-pulse" />
            <Skeleton className="h-4 w-20 animate-soft-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="loading-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-24 animate-soft-pulse" />
          <Skeleton className="h-8 w-32 animate-soft-pulse" />
          <Skeleton className="h-3 w-20 animate-soft-pulse" />
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
