"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Lightbulb,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { LeaderboardType } from "../services";
import { getMetricLabel, getProgressTips } from "../utils";

interface UserGuildProgressProps {
  guildId: string;
  guildName: string;
  rank: number;
  totalGuilds: number;
  metricValue: number;
  type: LeaderboardType;
  rankChange?: number; // Positive = improved, negative = dropped
}

export function UserGuildProgress({
  guildId,
  rank,
  totalGuilds,
  metricValue,
  type,
  rankChange = 0,
}: UserGuildProgressProps) {
  const percentile = ((totalGuilds - rank) / totalGuilds) * 100;
  const nextMilestone = rank > 10 ? Math.floor(rank / 10) * 10 : rank - 1;
  const tips = getProgressTips(type);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Your Guild&apos;s Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Rank</p>
              {rankChange !== 0 && (
                <Badge
                  variant={rankChange > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {rankChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(rankChange)}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold">#{rank}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Top {percentile.toFixed(0)}%
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-2">
              {getMetricLabel(type)}
            </p>
            <p className="text-3xl font-bold">{metricValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total earned</p>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone > 0 && (
          <div className="p-4 rounded-lg border bg-card/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="font-semibold">Next Milestone</p>
              </div>
              <Badge variant="secondary">Rank #{nextMilestone}</Badge>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Keep pushing to reach the next tier!
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <p className="font-semibold text-sm">Boost Your Ranking</p>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button asChild className="w-full">
          <Link href={`/guilds/${guildId}`}>Go to Guild Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
