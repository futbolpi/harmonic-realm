import { Skeleton } from "@/components/ui/skeleton";

export default function TopContributorsFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-56" />
      <div className="space-y-1 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
