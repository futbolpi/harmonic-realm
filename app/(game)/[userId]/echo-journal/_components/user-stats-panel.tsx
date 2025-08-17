"use client";

import { TrendingUp, Zap, Trophy, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/lib/schema/user";
import { xpForLevel } from "@/lib/utils/xp";

interface UserStatsPanelProps {
  user: UserProfile;
}

export function UserStatsPanel({ user }: UserStatsPanelProps) {
  // Calculate level progress
  const currentLevelXP = xpForLevel(user.level); // Mock calculation
  const nextLevelXP = xpForLevel(user.level + 1);
  const progressPercent =
    ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const stats = [
    {
      label: "Level",
      value: user.level,
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      label: "Total XP",
      value: user.xp.toLocaleString(),
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Shares Balance",
      value: user.sharePoints.toFixed(2),
      icon: Zap,
      color: "text-game-accent",
      bgColor: "bg-game-accent/10",
    },
    {
      label: "Total Earned",
      value: user.totalEarned.toFixed(2),
      icon: Trophy,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-game-primary/10 via-card/50 to-game-secondary/10 backdrop-blur-sm border-game-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-game-accent/20">
                <Star className="h-6 w-6 text-game-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Pioneer Level {user.level}
                </h3>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-game-accent">
                {user.xp.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {user.level + 1}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-game-accent/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
