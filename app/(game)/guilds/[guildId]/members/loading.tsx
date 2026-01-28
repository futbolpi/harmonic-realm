import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-4 sm:space-y-6">
        {/* Title Skeleton */}
        <div>
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Search & Filter Controls Skeleton - Mobile First */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <div className="flex gap-2 sm:gap-1">
            <Skeleton className="h-10 w-24 sm:w-28 rounded-md" />
            <Skeleton className="h-10 w-24 sm:w-28 rounded-md" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Leadership Card Skeleton */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 space-y-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Active Members Card Skeleton */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>

              {/* Member Item Skeletons */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border/50 p-3 sm:p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-12 rounded-md" />
                    <Skeleton className="h-12 rounded-md" />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Card Skeleton */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="space-y-4 sm:space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-20 rounded-md" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
