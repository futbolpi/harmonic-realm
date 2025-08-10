"use client";

import {
  Coins,
  Zap,
  MapPin,
  Trophy,
  Clock,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatNumber, formatPi } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/queries/use-profile";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";
import { QuickActions } from "./_components/quick-actions";

export default function DashboardPage() {
  const { userStats, isLoading, isError, error, refreshProfile } = useProfile();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert className="max-w-md mx-auto border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Failed to load profile: {error?.message}
            <Button
              onClick={refreshProfile}
              size="sm"
              variant="outline"
              className="ml-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userStats) {
    return null;
  }

  const { profile, stats, recentSessions, achievements } = userStats;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {profile.displayName || profile.piUsername}!
            </h1>
            <p className="text-muted-foreground">Ready to explore and mine?</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/50">
            Level {profile.level}
            {profile.isVerified && (
              <Star
                className="h-3 w-3 ml-1 text-neon-green"
                fill="currentColor"
              />
            )}
          </Badge>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Progress to Level {profile.level + 1}
            </span>
            <span className="text-primary">
              {stats.currentXP}/{stats.nextLevelXP} XP
            </span>
          </div>
          <Progress
            value={(stats.currentXP / stats.nextLevelXP) * 100}
            className="h-2"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 text-neon-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {formatNumber(profile.minerShares)}
            </div>
            <p className="text-xs text-muted-foreground">Miner Shares</p>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-neon-green">
              {formatPi(profile.piBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Pi Balance</p>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-neon-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {stats.nodesDiscovered}
            </div>
            <p className="text-xs text-muted-foreground">Nodes Found</p>
          </CardContent>
        </Card>

        <Card className="game-card">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-neon-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {stats.rank ? `#${stats.rank}` : "--"}
            </div>
            <p className="text-xs text-muted-foreground">Global Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions stats={stats} />
      </div>

      {/* Recent Activity */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Mining Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      session.status === "COMPLETED"
                        ? "bg-neon-green"
                        : session.status === "ACTIVE"
                        ? "bg-neon-orange animate-pulse"
                        : "bg-muted-foreground"
                    )}
                  ></div>
                  <div>
                    <p className="font-medium">
                      {session.nodeName || `Node ${session.nodeId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration}m session
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neon-green">
                    +{formatPi(session.earned)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {session.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View All Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-neon-orange" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .filter((a) => a.unlocked)
              .slice(0, 3)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <div className="w-10 h-10 rounded-full bg-neon-orange/20 flex items-center justify-center">
                    <span className="text-lg">{achievement.icon || "🏆"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-neon-green border-neon-green/50"
                  >
                    Unlocked
                  </Badge>
                </div>
              ))}
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View All Achievements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
