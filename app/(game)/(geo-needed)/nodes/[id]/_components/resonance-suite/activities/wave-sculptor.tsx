/**
 * WAVE SCULPTOR - Frequency Matching Minigame
 *
 * Original tuning game, now modularized as a suite activity.
 *
 * GAMEPLAY:
 * - Players adjust a slider to match a target frequency
 * - Visual feedback via animated sine waves on canvas
 * - Accuracy determines score (0-100)
 * - Closer match = higher score and rewards
 *
 * MECHANICS:
 * - Target frequency is procedurally generated from node seed
 * - Interference factor adds ±10% variance per session (anti-memorization)
 * - Lock visual appears when within 5Hz of target
 * - Canvas renders in real-time with smooth animations
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
} from "@/lib/resonance-suite/hooks";

export default function WaveSculptor({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // STATE & REFS
  // =========================================================================

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const [userFreq, setUserFreq] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateValue } = useProceduralGeneration(nodeFrequencySeed, 0.2);

  /**
   * CRITICAL FIX: Use useState with lazy initialization instead of useRef
   * This ensures the target frequency is calculated ONCE and never changes
   */
  const [targetFrequency] = useState(() => {
    const baseFrequency = generateValue(20, 80, 0);
    const interference = 1 + (Math.random() - 0.5) * 0.2; // 0.9 to 1.1
    return baseFrequency * interference;
  });

  // =========================================================================
  // SCORING
  // =========================================================================

  const { scoreFromAccuracy, isPerfectScore } = useActivityScoring(
    { baseRewardMultiplier: 1.0 },
    nodeRarity,
  );

  /**
   * Calculate accuracy based on frequency difference
   */
  const calculateAccuracy = (userFrequency: number): number => {
    const diff = Math.abs(userFrequency - targetFrequency);
    const rawScore = Math.max(0, 100 - diff * 4);
    return Math.round(rawScore * 10) / 10;
  };

  // =========================================================================
  // CANVAS ANIMATION
  // =========================================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      // Target Wave (rarity color)
      ctx.beginPath();
      const colorMap: Record<NodeTypeRarity, string> = {
        Common: "#3b82f6",
        Uncommon: "#22c55e",
        Epic: "#a855f7",
        Rare: "#f59e0b",
        Legendary: "#ec4899",
      };
      ctx.strokeStyle = colorMap[nodeRarity] || "#94a3b8";
      ctx.lineWidth = 4;

      for (let x = 0; x < w; x++) {
        const y =
          cy +
          Math.sin((x + phaseRef.current) * 0.01 * (targetFrequency / 40)) *
            (h / 3.5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // User Wave (cyan)
      ctx.beginPath();
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;

      for (let x = 0; x < w; x++) {
        const y =
          cy +
          Math.sin((x + phaseRef.current) * 0.01 * (userFreq / 40)) * (h / 3.5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Lock Visual (when close to target)
      if (Math.abs(userFreq - targetFrequency) < 5) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
        ctx.fillRect(0, 0, w, h);
      }

      phaseRef.current += 2;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [userFreq, targetFrequency, nodeRarity]);

  // =========================================================================
  // SUBMISSION
  // =========================================================================

  const handleStabilize = () => {
    const accuracy = calculateAccuracy(userFreq);
    const score = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(score),
      timestamp: new Date(),
      metadata: {
        targetFrequency,
        userFrequency: userFreq,
        difference: Math.abs(userFreq - targetFrequency),
      },
    };

    onComplete(result);

    // Reset state for next play
    setUserFreq(50);
    setHasInteracted(false);
  };

  // Track user interaction
  const handleSliderChange = (val: number[]) => {
    setUserFreq(val[0]);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  // const currentAccuracy = calculateAccuracy(userFreq);
  const isLocked = Math.abs(userFreq - targetFrequency) < 5;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Wave Sculptor</h3>
        <p className="text-sm text-muted-foreground">
          Match the resonance frequency to stabilize the node&apos;s harmonic
          field
        </p>
      </div>

      {/* Canvas */}
      <div className="relative aspect-video w-full rounded-md border border-slate-800 bg-black/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={480}
          height={270}
          className="w-full h-full"
        />

        {/* Frequency Display */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge
            variant="secondary"
            className="game-button font-mono backdrop-blur-sm"
          >
            {userFreq.toFixed(1)} Hz
          </Badge>

          {/* {hasInteracted && (
            <Badge
              variant={isLocked ? "default" : "secondary"}
              className={cn(
                "font-mono backdrop-blur-sm transition-all",
                isLocked && "bg-cyan-500 animate-pulse",
              )}
            >
              {currentAccuracy.toFixed(1)}% acc
            </Badge>
          )} */}
        </div>

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-cyan-500/20 border-2 border-cyan-500 rounded-full p-4 animate-pulse">
              <span className="text-4xl">🔒</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <Slider
          value={[userFreq]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={0.1}
          className="cursor-grab active:cursor-grabbing"
          disabled={isPending}
        />

        <Button
          size="lg"
          className={cn(
            "w-full font-bold text-white transition-all duration-500",
            isLocked
              ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-600"
              : "bg-slate-700 hover:bg-slate-600",
            isPending && "opacity-75 cursor-not-allowed",
          )}
          onClick={handleStabilize}
          disabled={!hasInteracted || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Result...
            </>
          ) : !hasInteracted ? (
            "ADJUST FREQUENCY TO BEGIN"
          ) : isLocked ? (
            "STABILIZE RESONANCE (LOCKED)"
          ) : (
            "STABILIZE RESONANCE"
          )}
        </Button>

        {/* Loading Overlay */}
        {isPending && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-pulse">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing resonance data and calculating rewards...</span>
            </div>
          </div>
        )}

        {/* Hint */}
        {!hasInteracted && !isPending && (
          <p className="text-xs text-center text-muted-foreground">
            Move the slider to start resonating with the node
          </p>
        )}
      </div>
    </div>
  );
}
