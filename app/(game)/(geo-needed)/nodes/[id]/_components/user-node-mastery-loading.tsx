import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserNodeMasteryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Current Mastery Overview Loading */}
      <Card className="bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-purple-500/5">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-violet-500/20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto bg-blue-500/30 animate-pulse" />
                <Skeleton className="h-3 w-16 mx-auto bg-slate-500/20" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-8 w-24 bg-violet-500/30 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Progress Section Loading */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-slate-600/30" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32 bg-slate-600/20" />
            <Skeleton className="h-4 w-8 bg-slate-600/20" />
          </div>
          <Skeleton className="h-3 w-full bg-slate-600/30" />
          <Skeleton className="h-3 w-48 mx-auto bg-slate-600/20" />
        </CardContent>
      </Card>

      {/* Lore Section Loading */}
      <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-indigo-500/20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-indigo-500/20" />
            <Skeleton className="h-4 w-4/5 bg-indigo-500/20" />
            <Skeleton className="h-4 w-3/4 bg-indigo-500/20" />
          </div>
        </CardContent>
      </Card>

      {/* Details Section Loading */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-slate-600/30" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 bg-slate-600/20" />
              <Skeleton className="h-4 w-16 bg-slate-600/20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
