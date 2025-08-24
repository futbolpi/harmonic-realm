"use client";

import { useState } from "react";
import { Zap, Target, Crown } from "lucide-react";

import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { UserNodeMasteryLoading } from "./user-node-mastery-loading";
import MasteryOverviewCard from "./mastery-overview-card";
import MasteryProgressInfo from "./mastery-progress-info";
import NodeTypeDetails from "./node-type-details";

interface UserNodeMasteryProps {
  nodeId: string;
  nodeType: {
    name: string;
    baseYieldPerMinute: number;
    lockInMinutes: number;
    rarity: NodeTypeRarity;
  };
  trigger?: React.ReactNode;
}

export function UserNodeMastery({
  nodeId,
  nodeType,
  trigger,
}: UserNodeMasteryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading: loading } = useMiningSessionAssets(nodeId);
  console.log({ data });

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Zap className="h-4 w-4" />
      View Mastery
    </Button>
  );

  const masteryData = data?.masteryInfo;
  const threshold = !!masteryData?.mastery?.level
    ? masteryData.availableThresholds.find(
        (t) => t.level === masteryData.mastery?.level
      )
    : undefined;
  const maxLevel = masteryData
    ? Math.max(...masteryData?.availableThresholds.map((t) => t.level))
    : 100;
  const isMaxLevel =
    !!masteryData?.mastery && masteryData?.mastery.level >= maxLevel;

  return (
    <Credenza open={isOpen} onOpenChange={setIsOpen}>
      <CredenzaTrigger asChild>{trigger || defaultTrigger}</CredenzaTrigger>
      <CredenzaContent className="max-w-2xl max-h-[90vh]">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {nodeType.name} Harmonic Resonance
          </CredenzaTitle>
          <CredenzaDescription>
            Your mastery progression and resonance with this Node frequency
          </CredenzaDescription>
        </CredenzaHeader>

        {loading && <UserNodeMasteryLoading />}

        {!loading && !!masteryData?.mastery && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Current Mastery Overview */}
            <MasteryOverviewCard
              mastery={masteryData.mastery}
              tierName={threshold?.tierName}
            />

            {/* Progress to Next Level */}
            {!isMaxLevel && masteryData.progressInfo.sessionsNeeded && (
              <MasteryProgressInfo progressInfo={masteryData.progressInfo} />
            )}

            {/* Max Level Achievement */}
            {isMaxLevel && (
              <Card className="bg-gradient-to-r from-accent/20 to-chart-4/20 border-accent/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Crown className="h-12 w-12 text-accent mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-foreground">
                      Perfect Harmonic Resonance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You have achieved complete synchronization with this Node
                      frequency
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lore Narrative */}
            {threshold?.loreNarrative && (
              <Card className="bg-gradient-to-br from-chart-1/10 to-secondary/10 border-chart-1/20">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">
                    Lattice Whispers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/50 pl-4">
                    &quot;{threshold.loreNarrative}&quot;
                  </blockquote>
                </CardContent>
              </Card>
            )}

            {/* Node Type Details */}
            <NodeTypeDetails
              masteryBonusPercent={masteryData.mastery.bonusPercent}
              nodeType={nodeType}
            />
          </div>
        )}

        {!loading && !masteryData?.mastery && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Resonance Established
            </h3>
            <p className="text-sm text-muted-foreground">
              Begin mining at this Node to develop harmonic resonance and unlock
              mastery progression.
            </p>
          </div>
        )}
      </CredenzaContent>
    </Credenza>
  );
}
