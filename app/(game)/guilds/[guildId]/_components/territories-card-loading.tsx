import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TerritoriesCardLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap">
          <div className="p-3 w-44 rounded-lg border bg-card">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 mt-2" />
          </div>
          <div className="p-3 w-44 rounded-lg border bg-card">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 mt-2" />
          </div>
          <div className="p-3 w-44 rounded-lg border bg-card">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 mt-2" />
          </div>
        </div>

        <div className="mt-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}
