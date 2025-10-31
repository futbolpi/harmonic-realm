import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContributionDetailLoading() {
  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex flex-col">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-32 mb-6" />

      {/* Card */}
      <Card className="border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info box */}
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>

          {/* Status box */}
          <div className="rounded-lg bg-accent/5 p-4 border border-accent/10">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardContent>

        {/* Button skeleton */}
        <div className="p-6 pt-2">
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  );
}
