"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/queries/use-profile";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";
import { QuickActions } from "./_components/quick-actions";
import DashboardError from "./_components/dashboard-error";
import LevelProgress from "./_components/level-progress";
import QuickStats from "./_components/quick-stats";
import RecentActivity from "./_components/recent-activity";
import RecentAchievements from "./_components/recent-achievements";

export default function DashboardPage() {
  const { data, isLoading, isError } = useProfile();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (isError || !data) {
    return <DashboardError />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {data.username}!
            </h1>
            <p className="text-muted-foreground">Ready to explore and mine?</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/50">
            Level {data.level}
            {data.level > 1 && (
              <Star
                className="h-3 w-3 ml-1 text-neon-green"
                fill="currentColor"
              />
            )}
          </Badge>
        </div>

        {/* Level Progress */}
        <LevelProgress currentLevel={data.level} currentXp={data.xp} />
      </div>

      {/* Quick Stats */}
      <QuickStats
        minerShares={data.sharePoints}
        nodesMined={data._count.sessions}
        piEarned={data.totalEarned}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions
          stats={{
            achievements: data._count.achievements,
            recentSessions: data.sessions.slice(0, 3).length,
            earnings: data.totalEarned,
            xp: data.xp,
            totalSessions: data._count.sessions,
            userId: data.id,
          }}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity sessions={data.sessions.slice(0, 3)} />

      {/* Recent Achievements */}
      <RecentAchievements achievements={data.achievements} />
    </div>
  );
}
