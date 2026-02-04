/**
 * RESONANCE SUITE MODAL
 *
 * Main orchestrator for all suite activities (games, verification, etc.)
 *
 * ARCHITECTURE:
 * - Uses activity registry for extensibility
 * - Lazy loads activity components for performance
 * - Handles activity selection, execution, and result submission
 * - Provides consistent UX across all activities
 *
 * FLOW:
 * 1. User opens suite (e.g., from node detail page)
 * 2. Suite selects random activity based on context
 * 3. Activity component renders with shared props
 * 4. User completes activity
 * 5. Result is validated and submitted to server
 * 6. Rewards are calculated and displayed
 */

"use client";

import { Suspense, useCallback, useTransition, useMemo } from "react";
import { Loader2, Waves, Trophy } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { useAuth } from "@/components/shared/auth/auth-context";
import { getRarityInfo } from "@/app/(game)/map/utils";
import { useLocation } from "@/hooks/use-location";
import { useMiningSessionAssets } from "@/hooks/queries/use-mining-session-assets";
import { submitTuningSession } from "@/actions/tuning-sessions/complete";
import {
  TUNING_STREAK_REQ_DAYS,
  TUNING_STREAK_REWARD,
  LANDLORD_TAX_RATE,
  NODE_TUNING_DAILY_CAP,
} from "@/config/site";
import { BaseActivityResult } from "@/lib/schema/resonance-suite";
import { useActivitySelection } from "@/lib/resonance-suite/hooks";
import { useProfile } from "@/hooks/queries/use-profile";

// ============================================================================
// TYPES
// ============================================================================

interface ResonanceSuiteProps {
  nodeId: string;
  nodeRarity: NodeTypeRarity;
  nodeFrequencySeed: number;
  isSponsored: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResonanceSuite({
  nodeId,
  nodeRarity,
  nodeFrequencySeed,
  isSponsored,
  isOpen,
  onClose,
}: ResonanceSuiteProps) {
  // =========================================================================
  // HOOKS
  // =========================================================================

  const [isPending, startTransition] = useTransition();
  const { accessToken } = useAuth();
  const { refreshSessionAssets, data: sessionAssets } =
    useMiningSessionAssets(nodeId);
  const { data: userProfile } = useProfile();
  const userLocation = useLocation();

  // Session data
  const tuningData = sessionAssets?.tuningSession;
  const currentStreak = tuningData?.currentStreak || 0;
  const playCount = tuningData?.playCount || 0;
  const attemptsLeft = NODE_TUNING_DAILY_CAP - playCount;

  // =========================================================================
  // ACTIVITY SELECTION
  // =========================================================================

  /**
   * Build context for activity filtering and selection
   * MEMOIZED: Prevents infinite loop by ensuring stable object reference
   */
  const activityContext = useMemo(
    () => ({
      userId: userProfile?.id || "",
      userLevel: userProfile?.level || 1,
      nodeId,
      nodeRarity,
      isSponsored,
      currentStreak,
      hasCompletedToday: playCount >= NODE_TUNING_DAILY_CAP,
    }),
    [
      userProfile?.id,
      userProfile?.level,
      nodeId,
      nodeRarity,
      isSponsored,
      currentStreak,
      playCount,
    ],
  );

  const { selectedActivity, selectionError } = useActivitySelection(
    activityContext,
    // "lattice-alignment",
  );

  // =========================================================================
  // RESULT SUBMISSION
  // =========================================================================

  /**
   * Handle activity completion
   * Validates result and submits to server
   */
  const handleActivityComplete = useCallback(
    (result: BaseActivityResult) => {
      if (!accessToken || !userLocation) {
        toast.error("Forbidden: Authentication or location required");
        return;
      }

      // Validate result
      if (!result.completed) {
        toast.error("Activity not completed");
        return;
      }

      if (result.score < 0 || result.score > 100) {
        toast.error("Invalid score");
        return;
      }

      startTransition(async () => {
        try {
          // For now, all activities use the tuning session endpoint
          // In the future, we'll route based on activity type
          const res = await submitTuningSession({
            nodeId,
            userLat: userLocation.latitude,
            userLng: userLocation.longitude,
            accuracyScore: result.score,
            accessToken,
          });

          if (res.success && res.data) {
            const {
              currentStreak: newStreak,
              milestoneReached,
              shares,
              grossShares,
              landlordTax,
              competitiveBonusApplied,
              competitiveMultiplier,
              averageAccuracy,
              chamberBonus,
            } = res.data;

            // Build success toast
            toast.success("Resonance Stabilized!", {
              description: (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy: {result.score.toFixed(0)}%</span>
                    <span className="text-cyan-400 font-bold">
                      +{shares} Shares
                    </span>
                  </div>

                  {/* Competitive bonus */}
                  {competitiveBonusApplied && (
                    <div className="text-xs text-emerald-300 bg-emerald-950/10 p-2 rounded border border-emerald-700">
                      <div className="font-semibold">Competitive Bonus!</div>
                      <div>
                        You beat the average accuracy ({averageAccuracy}%).
                        Reward x{competitiveMultiplier}
                      </div>
                    </div>
                  )}

                  {/* Landlord tax */}
                  {!!landlordTax && landlordTax > 0 && (
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-700">
                      <div>
                        Landlord Tax: -{landlordTax} π (Gross: {grossShares} |
                        Tax: {(LANDLORD_TAX_RATE * 100).toFixed(2)}% | Net:{" "}
                        {shares})
                      </div>
                    </div>
                  )}

                  {/* Milestone bonus */}
                  {milestoneReached ? (
                    <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-950/30 p-2 rounded animate-pulse">
                      <Trophy size={16} /> {TUNING_STREAK_REQ_DAYS}-Day Streak
                      Bonus! +{TUNING_STREAK_REWARD} Points
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Streak: {newStreak} days. Next bonus in{" "}
                      {TUNING_STREAK_REQ_DAYS -
                        (newStreak % TUNING_STREAK_REQ_DAYS)}{" "}
                      days.
                    </div>
                  )}

                  {/* Chamber boost */}
                  {chamberBonus.hasBoost && (
                    <div className="text-xs text-emerald-300 bg-emerald-950/10 p-2 rounded border border-emerald-700">
                      <div className="font-semibold">Echo Chamber Bonus!</div>
                      <div>
                        Level {chamberBonus.chamberLevel} Chamber boosted your
                        earnings by{" "}
                        {(chamberBonus.boostMultiplier * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              ),
              duration: 10000,
            });

            refreshSessionAssets();
            onClose?.();
          } else {
            toast.error(
              res.error || "There was an error, please try again later",
            );
          }
        } catch (e) {
          toast.error((e as Error).message);
        }
      });
    },
    [accessToken, userLocation, nodeId, refreshSessionAssets, onClose],
  );

  // =========================================================================
  // RENDER
  // =========================================================================

  const rarity = getRarityInfo(nodeRarity);
  const taxRate = (LANDLORD_TAX_RATE * 100).toFixed(2);

  // Calculate streak progress
  const streakProgress = currentStreak % TUNING_STREAK_REQ_DAYS || 0;
  const daysUntilBonus = TUNING_STREAK_REQ_DAYS - streakProgress;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-light tracking-wider">
              <Waves className="h-5 w-5 text-primary" />
              RESONANCE SUITE
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                {attemptsLeft}/{NODE_TUNING_DAILY_CAP}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "uppercase tracking-wider px-3 py-1 text-sm font-medium",
                  nodeRarity === "Legendary" ? rarity.shadowColor : "",
                  rarity.textColor,
                  rarity.borderColor,
                )}
              >
                {nodeRarity}
              </Badge>
            </div>
          </div>

          <DialogDescription className="text-slate-400 pt-2">
            {selectedActivity
              ? selectedActivity.config.description
              : "Loading activity..."}
          </DialogDescription>

          {/* Landlord Tax Notice */}
          {isSponsored && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/30 border border-accent/50">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs text-accent-foreground">
                Landlord Tax: {taxRate}% of earnings on this node
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Streak Progress */}
        <div className="bg-card p-3 rounded-lg border">
          <div className="flex justify-between text-xs mb-2 text-card-foreground">
            <span>Streak Bonus Progress</span>
            <span
              className={
                daysUntilBonus === TUNING_STREAK_REQ_DAYS
                  ? "text-primary font-bold"
                  : ""
              }
            >
              {daysUntilBonus === TUNING_STREAK_REQ_DAYS
                ? "Bonus Today!"
                : `${daysUntilBonus} days left`}
            </span>
          </div>
          <div className="flex gap-1 h-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all",
                  i < streakProgress
                    ? "bg-primary shadow-primary/10"
                    : "bg-background/90",
                )}
              />
            ))}
          </div>
        </div>

        {/* Activity Content */}
        <div className="min-h-[300px]">
          {selectionError && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-destructive mb-2">{selectionError}</p>
              <p className="text-sm text-muted-foreground">
                Try again later or contact support if this persists.
              </p>
            </div>
          )}

          {!selectionError && !selectedActivity && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!selectionError && selectedActivity && (
            <Suspense fallback={<ActivityLoadingFallback />}>
              <selectedActivity.component
                nodeId={nodeId}
                nodeRarity={nodeRarity}
                nodeFrequencySeed={nodeFrequencySeed}
                isSponsored={isSponsored}
                isPending={isPending}
                onComplete={handleActivityComplete}
                onCancel={onClose}
              />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function ActivityLoadingFallback() {
  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-4">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
