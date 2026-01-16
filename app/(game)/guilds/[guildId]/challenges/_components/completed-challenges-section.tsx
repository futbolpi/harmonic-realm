import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuildChallengesData } from "../services";

interface CompletedChallengesSectionProps {
  challenges: GuildChallengesData["completed"];
}

export default function CompletedChallengesSection({
  challenges,
}: CompletedChallengesSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">✅ Completed This Week</h2>

      <div className="grid gap-4">
        {challenges.map((progress) => {
          const template = progress.challenge.template;
          const topContributors = Object.entries(
            (progress.contributions || {}) as Record<string, number>
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

          return (
            <Card
              key={progress.id}
              className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        ✓ {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed{" "}
                        {progress.completedAt
                          ? format(
                              new Date(progress.completedAt),
                              "MMM d, h:mm a"
                            )
                          : "recently"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-emerald-600">
                      💎 {progress.challenge.rewardResonance}
                    </div>
                    <div className="text-emerald-600/70">
                      ⭐ {progress.challenge.rewardPrestige}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Top contributors */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Top Contributors</h4>
                  <div className="space-y-1">
                    {topContributors.map(([username, value], idx) => (
                      <div key={username} className="flex items-center gap-2">
                        <span>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                        </span>
                        <span className="text-sm">{username}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {value.toLocaleString()} points
                        </span>
                      </div>
                    ))}
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
