import { TrendingUp, Activity, Zap, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { SurgeSpawnLog, SurgeNode } from "../services";

interface SurgeStatsProps {
  spawnLog: SurgeSpawnLog | null;
  surges: SurgeNode[];
}

export function SurgeStats({ spawnLog, surges }: SurgeStatsProps) {
  if (!spawnLog) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No spawn data available for today
        </CardContent>
      </Card>
    );
  }

  const activeCount = surges.filter((s) => !s.isStabilized).length;
  const stabilizedCount = surges.filter((s) => s.isStabilized).length;
  const stabilizationRate =
    (stabilizedCount / spawnLog.totalNodesSpawned) * 100;

  // Calculate average activity score
  const avgActivityScore =
    surges.reduce((sum, s) => sum + s.activityScore, 0) / surges.length;

  // Top 3 hexes by activity
  const topHexes = spawnLog.topHexes.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spawned</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {spawnLog.totalNodesSpawned}
            </div>
            <p className="text-xs text-muted-foreground">Nodes created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Hexes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {spawnLog.totalHexesConsidered}
            </div>
            <p className="text-xs text-muted-foreground">Zones with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Stabilization Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stabilizationRate.toFixed(1)}%
            </div>
            <Progress value={stabilizationRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Activity Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgActivityScore.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per hex</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Hexes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Activity Hexes</CardTitle>
          <CardDescription>
            Highest activity zones for today&apos;s spawn cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHexes.map((hex, idx) => (
              <div key={hex.h3Index} className="flex items-center gap-4">
                <Badge variant={idx === 0 ? "default" : "secondary"}>
                  #{hex.rank}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono">
                      {hex.h3Index.slice(0, 16)}...
                    </span>
                    <span className="text-sm font-semibold">
                      {hex.score.toLocaleString()} pts
                    </span>
                  </div>
                  <Progress
                    value={(hex.score / topHexes[0].score) * 100}
                    className="h-2"
                  />
                </div>
                <Badge variant="outline">{hex.nodesSpawned} nodes</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stabilization Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Stabilization Progress</CardTitle>
          <CardDescription>
            Nodes converted to permanent content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active (Temporary)</span>
              <span className="font-semibold text-amber-500">
                {activeCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stabilized (Permanent)</span>
              <span className="font-semibold text-green-500">
                {stabilizedCount}
              </span>
            </div>
            <Progress value={stabilizationRate} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {stabilizedCount} of {spawnLog.totalNodesSpawned} nodes now
              permanent ({stabilizationRate.toFixed(1)}%)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
