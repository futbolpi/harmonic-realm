"use client";

import Link from "next/link";
import { Zap, Star, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActions } from "./actions";

interface QuickActionsProps {
  stats: {
    userId: string;
    totalSessions: number;
    recentSessions: number;
    xp: number;
    achievements: number;
    earnings: number;
    rank?: number;
  };
}

export function QuickActions({ stats }: QuickActionsProps) {
  const {
    achievements,
    recentSessions,
    xp,
    totalSessions,
    earnings,
    rank,
    userId,
  } = stats;

  const actions = getActions({ totalSessions, rank, userId });
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {actions.map((action, index) => (
        <Card
          key={index}
          className="game-card hover:scale-105 transition-transform duration-300"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full ${action.bgColor} border ${action.borderColor} flex items-center justify-center glow-border`}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <Badge
                    variant="outline"
                    className={`${action.color} ${action.borderColor} text-xs`}
                  >
                    {action.badge}
                  </Badge>
                </div>
              </CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              {action.description}
            </p>
            <Button asChild className="w-full game-button">
              <Link href={action.href}>
                <action.icon className="mr-2 h-4 w-4" />
                {action.title === "Explore Map"
                  ? "Open Map"
                  : `View ${action.title.split(" ")[0]}`}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Recent Sessions Card */}
      {recentSessions > 0 && (
        <Card className="game-card md:col-span-2 border-neon-orange/50 bg-neon-orange/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neon-orange/20 border border-neon-orange/50 flex items-center justify-center animate-pulse">
                  <Zap className="h-6 w-6 text-neon-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Active Mining Session
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have {recentSessions} active mining session
                    {recentSessions > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button asChild className="game-button">
                <Link href={`/${userId}/sessions`}>
                  <Zap className="mr-2 h-4 w-4" />
                  View Sessions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      <Card className="game-card md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-neon-green">
                +{earnings.toFixed(2)}π
              </div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-primary">{xp}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-neon-purple">
                {totalSessions}
              </div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <div className="text-lg font-bold text-neon-orange">
                {achievements}
              </div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
