import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>

          <aside>
            <Skeleton className="h-40 w-full rounded-md" />
          </aside>
        </div>
      </div>
    </main>
  );
}
