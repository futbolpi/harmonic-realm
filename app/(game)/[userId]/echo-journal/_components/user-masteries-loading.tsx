import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserMasteriesLoading() {
  return (
    <div className="space-y-6">
      {/* Summary Loading */}
      <Card className="bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-purple-500/5">
        <CardHeader>
          <Skeleton className="h-6 w-64 bg-violet-500/20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-slate-500/10"
              >
                <Skeleton className="h-5 w-5 bg-blue-500/30 animate-pulse" />
                <Skeleton className="h-6 w-8 bg-slate-500/30" />
                <Skeleton className="h-3 w-16 bg-slate-500/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mastery Cards Loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-slate-800/30 animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 bg-slate-600/50" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-slate-600/30" />
                    <Skeleton className="h-4 w-16 bg-slate-600/30" />
                    <Skeleton className="h-5 w-12 bg-slate-600/30" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 bg-slate-600/30" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-2 w-full bg-slate-600/30" />
                <Skeleton className="h-3 w-32 bg-slate-600/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 bg-slate-600/20" />
                <Skeleton className="h-12 bg-slate-600/20" />
              </div>
              <Skeleton className="h-9 w-full bg-slate-600/30" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
