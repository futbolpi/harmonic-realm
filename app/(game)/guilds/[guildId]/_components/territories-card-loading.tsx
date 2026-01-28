import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TerritoriesCardLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stable territories section */}
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30"
              >
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Under attack section placeholder */}
        <div>
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border-2 bg-red-50 dark:bg-red-950/30"
              >
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Attacking section placeholder */}
        <div>
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30"
              >
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
