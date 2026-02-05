import { Skeleton } from "@/components/ui/skeleton";

export default function RecentTransactionsFallback() {
  return (
    <div className="space-y-3" style={{ minHeight: 160 }}>
      {/* Title + summary */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Rows with fixed height to match table layout */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}
