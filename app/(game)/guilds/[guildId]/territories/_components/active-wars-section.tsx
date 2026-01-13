import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { InitialChallenges } from "../services";

interface ActiveWarsSectionProps {
  challenges: InitialChallenges;
}

export default function ActiveWarsSection({
  challenges,
}: ActiveWarsSectionProps) {
  const activeChallenges = challenges.filter((c) => !c.resolved);

  if (activeChallenges.length === 0) {
    return (
      <Card className="border-dashed border-border/50">
        <CardHeader>
          <CardTitle>Active Wars</CardTitle>
          <CardDescription>No ongoing territorial battles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your guild is currently at peace. Explore the map to challenge rival
            territories or defend against incoming attacks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Active Wars</h2>
        <p className="text-sm text-muted-foreground">
          {activeChallenges.length} ongoing territorial conflict
          {activeChallenges.length !== 1 ? "s" : ""} requiring guild
          coordination
        </p>
      </div>

      <div className="grid gap-4">
        {activeChallenges.map((challenge) => (
          <Card
            key={challenge.id}
            className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/2"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {challenge.defender.name}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <CardTitle className="text-base">
                      {challenge.attacker.name}
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Territory {challenge.territory.hexId}
                  </CardDescription>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="destructive">Live Battle</Badge>
                  <div className="text-xs text-muted-foreground">
                    Ends{" "}
                    {formatDistanceToNow(new Date(challenge.endsAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-3 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {challenge.defender.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {challenge.defenderScore.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      (challenge.defenderScore /
                        (challenge.defenderScore + challenge.attackerScore)) *
                      100
                    }
                  />
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {challenge.attacker.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {challenge.attackerScore.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      (challenge.attackerScore /
                        (challenge.defenderScore + challenge.attackerScore)) *
                      100
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-3">
                <div>
                  <div className="text-muted-foreground">Contributors</div>
                  <div className="font-semibold">
                    {challenge.contributions.length} members
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Ends in</div>
                  <div className="font-semibold">
                    {format(new Date(challenge.endsAt), "HH:mm")}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="default" className="flex-1">
                  <Link href={`/territories/${challenge.territory.hexId}`}>
                    View Battle
                  </Link>
                </Button>
                {/* <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Contribute
                </Button> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
