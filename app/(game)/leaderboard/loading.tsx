import { Trophy, Users, Globe, Coins, Search } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Global Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[Users, Globe, Coins].map((Icon, i) => (
          <Card key={i} className="game-card">
            <CardContent className="p-4 text-center">
              <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Skeleton */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pioneer Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-64" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-neon-orange" />
            Pioneer Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header Skeleton */}
            <div className="flex items-center space-x-4 border-b border-border/50 pb-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 hidden md:block" />
            </div>

            {/* Table Rows Skeleton */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 py-3 border-b border-border/20"
              >
                <Skeleton className="h-4 w-12" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 hidden md:block" />
              </div>
            ))}

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between pt-4">
              <Skeleton className="h-4 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
