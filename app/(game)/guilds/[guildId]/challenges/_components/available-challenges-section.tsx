"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChallengeGoalType } from "@/lib/generated/prisma/enums";
import type { GuildChallengesData } from "../services";
import AcceptChallengeModal from "./accept-challenge-modal";

interface AvailableChallengesSectionProps {
  challenges: GuildChallengesData["available"];
  guildId: string;
  canAccept: boolean;
  guildMembers: number;
  guildVaultLevel: number;
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

const goalTypeDescriptions: Record<ChallengeGoalType, string> = {
  TOTAL_SHAREPOINTS: "Earn sharePoints together",
  UNIQUE_NODES_MINED: "Mine unique nodes",
  PERFECT_TUNES: "Complete perfect tuning sessions",
  TERRITORY_CAPTURED: "Win territory challenges",
  VAULT_CONTRIBUTIONS: "Deposit to guild vault",
  MEMBER_STREAKS: "Members with activity streaks",
};

export default function AvailableChallengesSection({
  challenges,
  guildId,
  canAccept,
  guildMembers,
  guildVaultLevel,
}: AvailableChallengesSectionProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<
    GuildChallengesData["available"][number] | null
  >(null);

  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        📅 Available Challenges ({challenges.length})
      </h2>

      <div className="grid gap-4">
        {challenges.map((challenge) => {
          const template = challenge.template;

          const meetsReqs =
            guildMembers >= template.minMembers &&
            guildVaultLevel >= template.minVaultLevel;

          return (
            <Card
              key={challenge.id}
              className={`border-border/50 ${!meetsReqs ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
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
                      💎 {template.resonanceReward}
                    </div>
                    <div className="text-muted-foreground">
                      ⭐ {template.prestigeReward}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {goalTypeDescriptions[template.goalType] ||
                    "Complete challenge goal"}
                </p>

                <div className="bg-muted/50 rounded p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>
                      {guildMembers >= template.minMembers ? "✓" : "✗"}
                    </span>
                    <span>
                      {template.minMembers}+ active members (you have{" "}
                      {guildMembers})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      {guildVaultLevel >= template.minVaultLevel ? "✓" : "✗"}
                    </span>
                    <span>
                      Vault Level {template.minVaultLevel}+ (you have{" "}
                      {guildVaultLevel})
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedChallenge(challenge)}
                  disabled={!canAccept || !meetsReqs}
                  className="w-full"
                >
                  {!canAccept
                    ? "Max active challenges reached"
                    : !meetsReqs
                    ? "Requirements not met"
                    : "Accept Challenge"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accept Challenge Modal */}
      {selectedChallenge && (
        <AcceptChallengeModal
          challenge={selectedChallenge}
          guildId={guildId}
          activeMemberCount={guildMembers}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
}
