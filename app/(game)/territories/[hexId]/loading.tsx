import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function TerritoryDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Skeleton */}
            <Card className="h-96 bg-muted/50">
              <Skeleton className="w-full h-full rounded-lg" />
            </Card>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </Card>
              ))}
            </div>

            {/* Nodes Table Skeleton */}
            <Card className="p-4">
              <Skeleton className="h-6 w-24 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              ))}
            </Card>
          </div>

          {/* Right Column - Guild & Control Info */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
