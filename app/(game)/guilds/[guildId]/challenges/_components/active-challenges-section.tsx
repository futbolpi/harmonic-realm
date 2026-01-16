"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  convertRecordToArray,
  getChallengeActionLink,
  type UserContribution,
} from "@/lib/guild/challenges";
import type { ChallengeGoalType } from "@/lib/generated/prisma/enums";
import type { GuildChallengesData } from "../services";
import LeaderboardModal from "./leaderboard-modal";

interface ActiveChallengesSectionProps {
  challenges: GuildChallengesData["active"];
  guildId: string;
}

const difficultyColors = {
  EASY: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  HARD: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  BRUTAL: "bg-red-500/10 text-red-700 border-red-500/20",
};

const difficultyEmojis = {
  EASY: "🟢",
  MEDIUM: "🔵",
  HARD: "🟠",
  BRUTAL: "🔴",
};

export default function ActiveChallengesSection({
  challenges,
  guildId,
}: ActiveChallengesSectionProps) {
  const router = useRouter();
  const [selectedContributions, setSelectedContributions] = useState<{
    contributions: UserContribution[] | null;
    goalType: ChallengeGoalType;
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚡ Active Challenges</h2>
        <span className="text-sm text-muted-foreground">
          {challenges.length} / 4 active
        </span>
      </div>

      <div className="grid gap-4">
        {challenges.map((progress) => {
          const template = progress.challenge.template;
          const percentComplete = Math.min(
            (progress.currentValue / progress.targetValue) * 100,
            100
          );
          const timeRemaining = formatDistanceToNow(
            progress.challenge.endDate,
            { addSuffix: false }
          );

          // Count contributing members
          const contributingMembers = convertRecordToArray(
            progress.contributions
          );

          const actionLink = getChallengeActionLink(template.goalType, guildId);

          return (
            <Card
              key={progress.id}
              className="border-border/50 hover:border-border/80 transition-colors overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`mt-1 ${
                          difficultyColors[
                            template.difficulty as keyof typeof difficultyColors
                          ]
                        }`}
                      >
                        {
                          difficultyEmojis[
                            template.difficulty as keyof typeof difficultyEmojis
                          ]
                        }{" "}
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      💎 {progress.challenge.rewardResonance}
                    </div>
                    <div className="text-muted-foreground">
                      ⭐ {progress.challenge.rewardPrestige}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Goal description */}
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">
                      {percentComplete.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percentComplete} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.currentValue.toLocaleString()}</span>
                    <span>{progress.targetValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Time and members */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Time Remaining</div>
                    <div className="font-semibold">🕐 {timeRemaining}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Contributors</div>
                    <div className="font-semibold">
                      👥 {contributingMembers.length} members
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedContributions({
                        contributions: contributingMembers,
                        goalType: template.goalType,
                      })
                    }
                    className="flex-1"
                  >
                    View Leaderboard
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push(actionLink)}
                    className="flex-1"
                  >
                    Contribute Now →
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        contributions={selectedContributions?.contributions || null}
        onClose={() => setSelectedContributions(null)}
        onContributeClick={() => {
          if (selectedContributions) {
            const actionLink = getChallengeActionLink(
              selectedContributions.goalType,
              guildId
            );
            router.push(actionLink);
          }
        }}
      />
    </div>
  );
}
