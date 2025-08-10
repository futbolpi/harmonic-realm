import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MapSkeleton() {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Controls Skeleton */}
      <Card className="game-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 grid lg:grid-cols-3 gap-4">
        {/* Map Skeleton */}
        <div className="lg:col-span-2">
          <Card className="game-card h-full">
            <CardContent className="p-0 h-full">
              <Skeleton
                className="w-full h-full rounded-lg"
                style={{ minHeight: "500px" }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          <Card className="game-card">
            <CardContent className="p-8 text-center">
              <Skeleton className="h-12 w-12 mx-auto mb-4" />
              <Skeleton className="h-5 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardContent>
          </Card>

          <Card className="game-card">
            <CardContent className="p-4">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
