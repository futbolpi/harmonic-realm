"use client";

import type React from "react";

import { useState } from "react";
import { Zap, Target, Crown } from "lucide-react";

import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
  CredenzaBody,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { UserNodeMasteryLoading } from "./user-node-mastery-loading";
import MasteryOverviewCard from "./mastery-overview-card";
import NodeTypeDetails from "./node-type-details";
import MasteryProgressInfo from "./mastery-progress-info";

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

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
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
      <CredenzaContent>
        <CredenzaHeader className="pb-4">
          <CredenzaTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {nodeType.name} Harmonic Resonance
          </CredenzaTitle>
          <CredenzaDescription>
            Your mastery progression and resonance with this Node frequency
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="p-4 max-w-3xl max-h-96 overflow-y-auto">
          {loading && <UserNodeMasteryLoading />}

          {!loading && !!masteryData?.mastery && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current Mastery Stats */}
                <MasteryOverviewCard
                  mastery={{
                    bonusPercent: masteryData.mastery.bonusPercent,
                    level: masteryData.mastery.level,
                    sessionsCompleted: masteryData.mastery.sessionsCompleted,
                  }}
                  tierName={threshold?.tierName}
                />

                {/* Node Details */}
                <NodeTypeDetails
                  masteryBonusPercent={masteryData.mastery.bonusPercent}
                  nodeType={{
                    baseYieldPerMinute: nodeType.baseYieldPerMinute,
                    rarity: nodeType.rarity,
                  }}
                />
              </div>

              {!isMaxLevel && masteryData.progressInfo.sessionsNeeded && (
                <MasteryProgressInfo progressInfo={masteryData.progressInfo} />
              )}

              {/* Max Level Achievement */}
              {isMaxLevel && (
                <Card className="game-card border-primary/30">
                  <CardContent className="pt-4 text-center">
                    <Crown className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
                    <h3 className="font-bold text-primary mb-1">
                      Perfect Harmonic Resonance
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Complete synchronization achieved with this Node frequency
                    </p>
                  </CardContent>
                </Card>
              )}

              {threshold?.loreNarrative && (
                <Card className="game-card border-chart-1/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-chart-1">
                      Lattice Whispers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <blockquote className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/50 pl-3">
                      &quot;{threshold.loreNarrative}&quot;
                    </blockquote>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!loading && !masteryData?.mastery && (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                No Resonance Established
              </h3>
              <p className="text-sm text-muted-foreground">
                Begin mining at this Node to develop harmonic resonance and
                unlock mastery progression.
              </p>
            </div>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
