import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="game-card">
            <CardContent className="p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Phase Progress Skeleton */}
      <Card className="game-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>

      {/* Navigation Hub Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="game-card">
              <CardContent className="p-6 text-center">
                <Skeleton className="h-12 w-12 mx-auto mb-3" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
