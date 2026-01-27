import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArtifactsCardLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Guild Artifacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg border bg-card">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-1 w-full" />
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
