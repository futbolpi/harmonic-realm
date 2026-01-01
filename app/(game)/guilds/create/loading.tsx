import { Skeleton } from "@/components/ui/skeleton";

export default function CreateGuildLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-4">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-md md:col-span-2" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
