/**
 * FREQUENCY LOCK - Multi-Dimensional Slider Puzzle
 *
 * LORE ALIGNMENT:
 * Each node resonates on multiple harmonic frequencies simultaneously.
 * Players must align all frequency channels to achieve perfect resonance.
 * The node's Pi-derived seed determines the target harmonics.
 *
 * GAMEPLAY:
 * - 3 frequency sliders (Low, Mid, High)
 * - Each slider has a hidden target value
 * - Visual feedback shows proximity (cold/warm/hot)
 * - Lock indicator for each channel
 * - All channels must be locked simultaneously
 *
 * MECHANICS:
 * - Procedural target generation from node seed
 * - Variance based on node rarity (harder = tighter tolerance)
 * - Real-time visual feedback with color gradients
 * - Score based on average distance from targets
 * - Time bonus for quick completion
 *
 * UX FEATURES:
 * - Color-coded feedback (blue=cold, yellow=warm, green=locked)
 * - Lock animations when target is hit
 * - Progress indicator showing channels locked
 * - Loading state during submission
 */

"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Zap, Loader2, Clock, TrendingUp } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
} from "@/lib/resonance-suite/hooks";

interface Channel {
  id: string;
  name: string;
  value: number;
  target: number;
  tolerance: number;
  locked: boolean;
}

export default function FrequencyLock({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateValue } = useProceduralGeneration(nodeFrequencySeed, 0.1);

  // Tolerance based on rarity (harder = tighter)
  const tolerance =
    {
      Common: 8,
      Uncommon: 6,
      Rare: 5,
      Epic: 4,
      Legendary: 3,
    }[nodeRarity] || 8;

  // =========================================================================
  // STATE
  // =========================================================================

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: "low",
      name: "Low Frequency",
      value: 50,
      target: generateValue(20, 80, 0),
      tolerance,
      locked: false,
    },
    {
      id: "mid",
      name: "Mid Frequency",
      value: 50,
      target: generateValue(20, 80, 1),
      tolerance,
      locked: false,
    },
    {
      id: "high",
      name: "High Frequency",
      value: 50,
      target: generateValue(20, 80, 2),
      tolerance,
      locked: false,
    },
  ]);

  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [allLocked, setAllLocked] = useState(false);

  // Time bonus thresholds (30 seconds max bonus)
  const MAX_BONUS_TIME = 30; // seconds
  const currentTimeBonus = Math.max(
    0,
    Math.min(20, (MAX_BONUS_TIME - elapsedSeconds) * 0.67),
  );

  // =========================================================================
  // TIMER
  // =========================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(Math.floor(elapsed));
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  // =========================================================================
  // LOCK DETECTION
  // =========================================================================

  useEffect(() => {
    const updatedChannels = channels.map((channel) => {
      const distance = Math.abs(channel.value - channel.target);
      const locked = distance <= channel.tolerance;
      return { ...channel, locked };
    });

    setChannels(updatedChannels);

    const allChannelsLocked = updatedChannels.every((ch) => ch.locked);
    setAllLocked(allChannelsLocked);
  }, [channels.map((ch) => ch.value).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleSliderChange = (channelId: string, newValue: number[]) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, value: newValue[0] } : ch,
      ),
    );
  };

  const handleSubmit = () => {
    // Calculate accuracy based on average distance from targets
    const distances = channels.map((ch) => Math.abs(ch.value - ch.target));
    const avgDistance = distances.reduce((a, b) => a + b, 0) / channels.length;
    const maxDistance = 50; // Max possible distance

    // Accuracy: closer = higher score
    const proximityScore = Math.max(0, 100 - (avgDistance / maxDistance) * 100);

    // Time bonus
    const accuracy = Math.min(100, proximityScore + currentTimeBonus);
    const score = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(score),
      timeSpent: elapsedSeconds * 1000,
      timestamp: new Date(),
      metadata: {
        avgDistance,
        elapsedSeconds,
        timeBonus: currentTimeBonus,
      },
    };

    onComplete(result);

    // Reset state for potential replay
    setTimeout(() => {
      setChannels([
        {
          id: "low",
          name: "Low Frequency",
          value: 50,
          target: generateValue(20, 80, 0),
          tolerance,
          locked: false,
        },
        {
          id: "mid",
          name: "Mid Frequency",
          value: 50,
          target: generateValue(20, 80, 1),
          tolerance,
          locked: false,
        },
        {
          id: "high",
          name: "High Frequency",
          value: 50,
          target: generateValue(20, 80, 2),
          tolerance,
          locked: false,
        },
      ]);
      setAllLocked(false);
    }, 500);
  };

  // =========================================================================
  // SCORING
  // =========================================================================

  const { scoreFromAccuracy, isPerfectScore } = useActivityScoring(
    { baseRewardMultiplier: 1.0 },
    nodeRarity,
  );

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  const getProximityColor = (channel: Channel): string => {
    const distance = Math.abs(channel.value - channel.target);

    if (distance <= channel.tolerance) {
      return "text-green-400";
    } else if (distance <= channel.tolerance * 2) {
      return "text-yellow-400";
    } else if (distance <= channel.tolerance * 4) {
      return "text-orange-400";
    } else {
      return "text-blue-400";
    }
  };

  const getProximityLabel = (channel: Channel): string => {
    const distance = Math.abs(channel.value - channel.target);

    if (distance <= channel.tolerance) return "LOCKED";
    if (distance <= channel.tolerance * 2) return "Hot";
    if (distance <= channel.tolerance * 4) return "Warm";
    return "Cold";
  };

  // Time urgency color
  const getTimeColor = (): string => {
    if (elapsedSeconds < 15) return "text-green-400";
    if (elapsedSeconds < 25) return "text-yellow-400";
    return "text-red-400";
  };

  const getTimeBgColor = (): string => {
    if (elapsedSeconds < 15) return "bg-green-500/10 border-green-500/30";
    if (elapsedSeconds < 25) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  const lockedCount = channels.filter((ch) => ch.locked).length;
  const bonusActive = currentTimeBonus > 0;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Frequency Lock
          </h3>
          <Badge variant={allLocked ? "default" : "secondary"}>
            {lockedCount}/3 Channels
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Align all frequency channels to achieve harmonic resonance
        </p>
      </div>

      {/* TIME BONUS DISPLAY - FOMO INDUCING */}
      <div
        className={cn(
          "p-3 rounded-lg border-2 transition-all",
          getTimeBgColor(),
          elapsedSeconds > 25 && "animate-pulse",
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={cn("h-4 w-4", getTimeColor())} />
            <span className="text-sm font-semibold">Time Bonus</span>
          </div>
          <span className={cn("text-xl font-bold font-mono", getTimeColor())}>
            +{currentTimeBonus.toFixed(1)}%
          </span>
        </div>

        {/* Bonus progress bar */}
        <Progress value={(currentTimeBonus / 20) * 100} className="h-2 mb-2" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {elapsedSeconds}s elapsed
          </span>
          {bonusActive ? (
            <span
              className={cn(
                "flex items-center gap-1 font-semibold",
                elapsedSeconds > 25 && "animate-pulse",
              )}
            >
              <TrendingUp className="h-3 w-3" />
              {elapsedSeconds > 25
                ? "Bonus fading fast!"
                : "Finish quick for max bonus!"}
            </span>
          ) : (
            <span className="text-red-400">No time bonus</span>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-6">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              channel.locked
                ? "border-green-500/50 bg-green-500/5"
                : "border-border bg-card",
            )}
          >
            {/* Channel Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {channel.locked ? (
                  <Lock className="h-4 w-4 text-green-400 animate-pulse" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{channel.name}</span>
              </div>
              <Badge
                variant="outline"
                className={cn("border-current", getProximityColor(channel))}
              >
                {getProximityLabel(channel)}
              </Badge>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <Slider
                value={[channel.value]}
                onValueChange={(val) => handleSliderChange(channel.id, val)}
                min={0}
                max={100}
                step={0.5}
                disabled={isPending}
                className="cursor-grab active:cursor-grabbing"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 Hz</span>
                <span className={cn("font-mono", getProximityColor(channel))}>
                  {channel.value.toFixed(1)} Hz
                </span>
                <span>100 Hz</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Locked Indicator */}
      {allLocked && !isPending && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center animate-pulse">
          <Lock className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-400">
            Perfect Harmonic Resonance Achieved!
          </p>
          {bonusActive && (
            <p className="text-xs text-yellow-400 mt-1 font-semibold">
              ⚡ {currentTimeBonus.toFixed(1)}% time bonus active - Submit now!
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        size="lg"
        className={cn(
          "w-full transition-all",
          allLocked && "bg-green-500 hover:bg-green-600",
        )}
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Result...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            {allLocked
              ? `Lock In (+${currentTimeBonus.toFixed(1)}% bonus)`
              : "Submit Attempt"}
          </>
        )}
      </Button>

      {/* Loading Banner */}
      {isPending && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-pulse">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Stabilizing frequency locks...</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lock className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-medium">How to Play:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Adjust each slider to find the target frequency</li>
              <li>Color changes show proximity (cold → warm → hot)</li>
              <li>Lock all 3 channels for maximum score</li>
              <li>
                <strong>Faster completion = bigger time bonus!</strong>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
