import { ArrowLeft } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ChallengesLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <button className="rounded p-2 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>

        {/* Active Challenges Section */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Challenge Cards Skeleton */}
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-12 w-full rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1 rounded" />
                  <Skeleton className="h-9 flex-1 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Challenges Section */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />

          {[...Array(1)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-32 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
