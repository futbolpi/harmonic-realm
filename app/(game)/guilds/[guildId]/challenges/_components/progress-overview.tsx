import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildChallengesData } from "../services";

interface ProgressOverviewProps {
  activeCount: number;
  completedCount: number;
  maxActive: number;
  completed: GuildChallengesData["completed"];
}

export default function ProgressOverview({
  activeCount,
  completedCount,
  maxActive,
  completed,
}: ProgressOverviewProps) {
  // Calculate total rewards from completed challenges
  const totalResonance = completed.reduce(
    (sum, c) => sum + c.challenge.rewardResonance,
    0
  );

  const stats = [
    {
      label: "Active",
      value: `${activeCount}/${maxActive}`,
      icon: "⚡",
      color: "bg-gradient-to-br from-primary/10 to-primary/5",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: "✓",
      color: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5",
    },
    {
      label: "Rewards Earned",
      value: `${totalResonance.toLocaleString()} RES`,
      icon: "💎",
      color: "bg-gradient-to-br from-amber-500/10 to-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className={`border-border/50 ${stat.color}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>{stat.icon}</span>
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
