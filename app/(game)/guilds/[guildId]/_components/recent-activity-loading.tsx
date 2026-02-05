import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivityFallback() {
  return (
    <div className="space-y-3" style={{ minHeight: 160 }}>
      {/* Header placeholder */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Table-like rows: fixed heights to avoid layout shift */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
