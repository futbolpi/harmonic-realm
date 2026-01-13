import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GuildTerritoriesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-card p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="border-b border-border bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Map Skeleton */}
      <div className="border-b border-border bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>

      {/* Active Wars Skeleton */}
      <div className="border-b border-border bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
