import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  guildId: string;
  activeChallenges: {
    id: string;
    currentValue: number;
    targetValue: number;
    challenge: {
      endDate: Date;
      rewardResonance: number;
      rewardPrestige: number;
      template: {
        name: string;
      };
    };
  }[];
};

const ActiveChallenges = ({ guildId, activeChallenges }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Active Challenges ({activeChallenges.length} Active)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.length === 0 && (
          <p className="text-sm text-muted-foreground">No active challenges</p>
        )}

        {activeChallenges.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-lg border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-semibold">{c.challenge.template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.currentValue.toLocaleString()} /{" "}
                    {c.targetValue.toLocaleString()} •{" "}
                    {formatDistanceToNow(c.challenge.endDate)} left
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                💎 {c.challenge.rewardResonance} • ⭐{" "}
                {c.challenge.rewardPrestige}
              </div>
            </div>
            <Progress
              value={(c.currentValue / c.targetValue) * 100}
              className="h-2 rounded-full"
            />
          </div>
        ))}

        <div>
          <Link
            href={`/guilds/${guildId}/challenges`}
            className="text-sm text-primary"
          >
            View All Challenges →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveChallenges;
