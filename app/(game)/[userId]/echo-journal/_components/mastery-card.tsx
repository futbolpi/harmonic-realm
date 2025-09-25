"use client";

import { Crown, Sparkles, Circle, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { UserNodeMastery } from "@/lib/generated/prisma/client";
import { getRarityInfo } from "@/app/(game)/map/utils";
import DetailedViewDrawer from "./detailed-view-drawer";

interface MasteryProgressInfo {
  currentLevel: number;
  nextLevel: number | null;
  sessionsNeeded: number | null;
  progressPercent: number;
}

interface MasteryInfo {
  mastery: UserNodeMastery & {
    nodeType: {
      rarity: NodeTypeRarity;
      name: string;
      extendedLore: string | null;
      baseYieldPerMinute: number;
    };
  };
  progressInfo: MasteryProgressInfo;
  loreNarrative: string | null;
  tierName: string;
  isMaxLevel: boolean;
}

interface MasteryCardProps {
  masteryInfo: MasteryInfo;
  animationDelay: number;
}

const tierConfig = {
  Initiate: { color: "text-blue-300", icon: Circle },
  Apprentice: { color: "text-yellow-300", icon: Sparkles },
  Adept: { color: "text-purple-300", icon: Users },
  Master: { color: "text-red-300", icon: Crown },
};

export function MasteryCard({ masteryInfo, animationDelay }: MasteryCardProps) {
  const { mastery, progressInfo, tierName, isMaxLevel, loreNarrative } =
    masteryInfo;
  const rarity = getRarityInfo(mastery.nodeType.rarity);
  const tier =
    tierConfig[tierName as keyof typeof tierConfig] || tierConfig.Initiate;
  const TierIcon = tier.icon;

  return (
    <Card
      className={`${rarity.shadowColor} ${rarity.borderColor} ${rarity.textColor} transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-4`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold">
              {mastery.nodeType.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <TierIcon className={`h-4 w-4 ${tier.color}`} />
              <span className={`text-sm ${tier.color}`}>{tierName}</span>
              <Badge variant="outline" className="text-xs">
                Level {mastery.level}
              </Badge>
            </div>
          </div>
          <Badge className={rarity.color}>{mastery.nodeType.rarity}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        {!isMaxLevel && progressInfo.sessionsNeeded && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Resonance Progress</span>
              <span className="text-white">
                {progressInfo.progressPercent}%
              </span>
            </div>
            <Progress
              value={progressInfo.progressPercent}
              className="h-2 bg-black/20"
            />
            <p className="text-xs text-muted-foreground">
              {progressInfo.sessionsNeeded} sessions until Level{" "}
              {progressInfo.nextLevel}
            </p>
          </div>
        )}

        {isMaxLevel && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
            <Crown className="h-4 w-4 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium text-yellow-100">
              Perfect Resonance Achieved
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 rounded bg-black/20">
            <div className="font-bold text-white">{mastery.bonusPercent}%</div>
            <div className="text-xs text-muted-foreground">Yield Bonus</div>
          </div>
          <div className="text-center p-2 rounded bg-black/20">
            <div className="font-bold text-white">
              {mastery.sessionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>

        {/* Detailed View Drawer */}
        <DetailedViewDrawer
          loreNarrative={loreNarrative}
          mastery={mastery}
          tierColor={tier.color}
          tierName={tierName}
        />
      </CardContent>
    </Card>
  );
}
