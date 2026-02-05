"use client";

import { useMemo } from "react";
import { Award, TrendingUp, Users, Zap, ChevronRight } from "lucide-react";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
} from "@/components/credenza";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getPrestigeTier,
  getTierRewards,
  TIER_COLORS,
  TIER_ICONS,
  TIER_LEVELS,
} from "@/lib/utils/prestige";

type PrestigeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestigePoints: number;
  prestigeLevel: number;
  prestigeMultiplier: number;
  guildName: string;
};

export default function PrestigeModal({
  open,
  onOpenChange,
  prestigePoints,
  prestigeLevel,
  prestigeMultiplier,
  guildName,
}: PrestigeModalProps) {
  const currentTier = getPrestigeTier(prestigeLevel);
  const currentTierData = TIER_LEVELS.find((t) => t.tier === currentTier)!;
  const currentTierRewards = getTierRewards(currentTier);
  const tierColors = TIER_COLORS[currentTier];

  const nextTier = useMemo(() => {
    const currentIndex = TIER_LEVELS.findIndex((t) => t.tier === currentTier);
    return currentIndex < TIER_LEVELS.length - 1
      ? TIER_LEVELS[currentIndex + 1]
      : null;
  }, [currentTier]);

  const progressToNextLevel = useMemo(() => {
    const currentLevelPoints = prestigeLevel * 1000;
    const pointsInLevel = prestigePoints - currentLevelPoints;
    return (pointsInLevel / 1000) * 100;
  }, [prestigePoints, prestigeLevel]);

  const progressToNextTier = useMemo(() => {
    if (!nextTier) return 100;
    const tierStart = currentTierData.minLevel;
    const tierEnd = nextTier.minLevel;
    const tierRange = tierEnd - tierStart;
    const currentProgress = prestigeLevel - tierStart;
    return (currentProgress / tierRange) * 100;
  }, [prestigeLevel, currentTierData, nextTier]);

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Guild Prestige System
          </CredenzaTitle>
          <CredenzaDescription>
            Long-term progression that rewards sustained guild excellence
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody className="space-y-6 max-h-[90vh] overflow-y-auto">
          {/* Current Status */}
          <div
            className={`p-6 rounded-lg border-2 ${tierColors.border} ${tierColors.bg} shadow-lg ${tierColors.glow}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{TIER_ICONS[currentTier]}</span>
                  <h3 className={`text-2xl font-bold ${tierColors.text}`}>
                    {currentTier} Tier
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{guildName}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{prestigeLevel}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to Level {prestigeLevel + 1}</span>
                <span className="font-medium">
                  {prestigePoints.toLocaleString()} /{" "}
                  {((prestigeLevel + 1) * 1000).toLocaleString()} pts
                </span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          </div>

          {/* Current Benefits */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Active Benefits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Member Earnings
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{((prestigeMultiplier - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {prestigeMultiplier.toFixed(2)}x multiplier
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Tier Bonuses
                </div>
                <div className="text-sm space-y-1">
                  <div>✓ +{currentTierRewards.memberCapBonus} member slots</div>
                  <div>
                    ✓ +{currentTierRewards.vaultCapacityBonus * 100}% vault cap
                  </div>
                  <div>
                    ✓ +{currentTierRewards.harvestSpeedBonus * 100}% harvest
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Tier Preview */}
          {nextTier && (
            <div className="p-4 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Next: {nextTier.tier} Tier
                </h4>
                <Badge variant="secondary">
                  Level {nextTier.minLevel} required
                </Badge>
              </div>

              <Progress value={progressToNextTier} className="h-2 mb-2" />

              <div className="text-xs text-muted-foreground mb-3">
                {nextTier.minLevel - prestigeLevel} levels to go
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {(() => {
                  const nextRewards = getTierRewards(nextTier.tier);
                  return (
                    <>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span>+{nextRewards.memberCapBonus} member slots</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span>
                          +{nextRewards.vaultCapacityBonus * 100}% vault
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span>
                          +{nextRewards.harvestSpeedBonus * 100}% harvest
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        <span>Exclusive cosmetics</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <Separator />

          {/* All Tiers Overview */}
          <div>
            <h4 className="text-sm font-semibold mb-3">All Prestige Tiers</h4>
            <div className="space-y-2">
              {TIER_LEVELS.map((tier) => {
                const isCurrentTier = tier.tier === currentTier;
                const isPastTier = tier.maxLevel < prestigeLevel;
                const colors = TIER_COLORS[tier.tier];
                const rewards = getTierRewards(tier.tier);

                return (
                  <div
                    key={tier.tier}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrentTier
                        ? `${colors.border} ${colors.bg} ${colors.glow} border-2`
                        : isPastTier
                          ? "border-muted bg-muted/30 opacity-60"
                          : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">
                          {TIER_ICONS[tier.tier]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{tier.tier}</span>
                            {isCurrentTier && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-5"
                              >
                                Current
                              </Badge>
                            )}
                            {isPastTier && (
                              <Badge
                                variant="outline"
                                className="text-xs h-5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                              >
                                ✓ Unlocked
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Levels {tier.minLevel}-{tier.maxLevel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>+{rewards.memberCapBonus} members</div>
                        <div>
                          +{(tier.minLevel * 0.005 * 100).toFixed(1)}% to +
                          {(tier.maxLevel * 0.005 * 100).toFixed(1)}% bonus
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* How to Earn */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Earning Prestige</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 dark:text-emerald-400">✓</div>
                <div>
                  <div className="font-medium">Complete Challenges</div>
                  <div className="text-xs text-muted-foreground">
                    50-200 points per tier
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 dark:text-emerald-400">✓</div>
                <div>
                  <div className="font-medium">Win Territories</div>
                  <div className="text-xs text-muted-foreground">
                    100-300 points per victory
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 dark:text-emerald-400">✓</div>
                <div>
                  <div className="font-medium">Member Milestones</div>
                  <div className="text-xs text-muted-foreground">
                    25 points per achievement
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 dark:text-emerald-400">✓</div>
                <div>
                  <div className="font-medium">Vault Upgrades</div>
                  <div className="text-xs text-muted-foreground">
                    50× level in points
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Decay Warning */}
          <div className="p-4 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Weekly Decay System
                </h4>
                <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p>
                    Every Sunday at 23:00 UTC, inactive guilds lose prestige:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>10+ active members: -0.5% decay</li>
                    <li>&lt;10 active members: -2% decay</li>
                  </ul>
                  <p className="mt-2 font-medium">
                    Keep your guild active to minimize losses!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
