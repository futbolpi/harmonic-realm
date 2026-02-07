// app/(game)/resonance-surge/page.tsx (updated header section)
import { Suspense } from "react";
import { Activity, Zap, TrendingUp } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapView } from "./_components/heatmap-view";
import { SurgeStats } from "./_components/surge-stats";
import { TopHexesTable } from "./_components/top-hexes-table";
import { SurgeInfoModal } from "./_components/surge-info-modal"; // NEW
import { getSurgeData } from "./services";

export const metadata = {
  title: "Resonance Surge - Daily High-Yield Nodes",
  description:
    "Explore today's Resonance Surge nodes spawned in high-activity zones.",
};

export default async function ResonanceSurgePage() {
  const { surges, spawnLog } = await getSurgeData();

  const activeCount = surges.filter((s) => !s.isStabilized).length;
  const stabilizedCount = surges.filter((s) => s.isStabilized).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with Info Modal */}
        <div className="mb-8 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Zap className="h-8 w-8 text-amber-500" />
                Resonance Surge
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Daily high-yield nodes spawned in active zones. Mine one to
                anchor it permanently.
              </p>
            </div>

            {/* Info Modal Button */}
            <SurgeInfoModal />
          </div>

          {/* Quick explainer */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                New to Surge?
              </span>{" "}
              Click &quot;?&quot; above to learn how your activities attract
              nodes, strategic tips for maximizing rewards, and why this solves
              the rural player problem.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Nodes</p>
                  <p className="text-3xl font-bold">{activeCount}</p>
                </div>
                <Activity className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Stabilized Today
                  </p>
                  <p className="text-3xl font-bold">{stabilizedCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Hexes</p>
                  <p className="text-3xl font-bold">
                    {spawnLog?.totalHexesConsidered || 0}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Heatmap</TabsTrigger>
            <TabsTrigger value="nodes">Top Hexes</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <Suspense fallback={<MapSkeleton />}>
              <HeatmapView surges={surges} />
            </Suspense>
          </TabsContent>

          <TabsContent value="nodes">
            <TopHexesTable surges={surges} />
          </TabsContent>

          <TabsContent value="stats">
            <SurgeStats spawnLog={spawnLog} surges={surges} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function MapSkeleton() {
  return (
    <Card>
      <CardContent className="h-[600px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </CardContent>
    </Card>
  );
}
