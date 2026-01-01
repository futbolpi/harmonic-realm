import { Skeleton } from "@/components/ui/skeleton";

export default function VaultFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>
      <Skeleton className="h-32 w-full rounded-md" />
    </div>
  );
}
