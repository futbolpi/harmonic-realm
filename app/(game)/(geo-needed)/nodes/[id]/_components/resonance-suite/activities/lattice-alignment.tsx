/**
 * LATTICE ALIGNMENT - Spatial Rotation Puzzle
 *
 * LORE ALIGNMENT:
 * The cosmic Lattice exists in multidimensional space, visible as rotating
 * geometric patterns. Each node's frequency creates a unique lattice signature.
 * Players must align the lattice structure to match the node's harmonic pattern.
 *
 * GAMEPLAY:
 * - 4 rotating rings with symbols
 * - Each ring can be rotated independently
 * - Target pattern shown at top
 * - Align all rings to match target
 * - Rings rotate at different speeds based on frequency
 *
 * MECHANICS:
 * - Procedural pattern generation from node seed
 * - Rotation speed varies by node rarity
 * - Score based on alignment accuracy
 * - Time pressure for higher rarities
 * - Visual feedback for partial matches
 *
 * UX FEATURES:
 * - SVG-based ring rendering
 * - Smooth rotation animations
 * - Match indicators for each ring
 * - Live alignment percentage
 * - Loading state during submission
 */

/**
 * LATTICE ALIGNMENT - Spatial Rotation Puzzle (FIXED)
 *
 * BUGS FIXED:
 * 1. Symbol duplication - Ensured each ring has unique symbols in each position
 * 2. Misaligned preview - Fixed target pattern to match actual ring positions
 * 3. Auto-submission bug - Now only submits when ALL rings are perfectly matched
 * 4. Race condition in match detection - Improved state update logic
 *
 * KEY CHANGES:
 * - Symbols are now unique per ring (no duplicates in a single ring)
 * - Target preview shows the EXACT symbol at the target rotation
 * - Match detection runs in useEffect with proper dependencies
 * - Auto-submit only triggers when matchedCount === totalRings
 * - Added visual feedback for partial matches
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Compass, Check, X, Zap, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
} from "@/lib/resonance-suite/hooks";

interface Ring {
  id: number;
  symbols: string[];
  currentRotation: number; // 0-3 (4 positions)
  targetRotation: number;
  matched: boolean;
}

type Grid = Ring[];

const SYMBOLS = ["◆", "◇", "◈", "◉", "○", "◎", "●", "◐"];

export default function LatticeAlignment({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateInt } = useProceduralGeneration(nodeFrequencySeed, 0.1);

  const timeLimit =
    {
      Common: 90,
      Uncommon: 75,
      Rare: 60,
      Epic: 50,
      Legendary: 45,
    }[nodeRarity] || 90;

  /**
   * FIXED: Initialize rings with unique symbols (no duplicates per ring)
   */
  const initializeRings = useCallback((): Grid => {
    const grid: Grid = [];

    for (let ringIndex = 0; ringIndex < 4; ringIndex++) {
      // Generate 4 unique symbols for this ring
      const availableSymbols = [...SYMBOLS];
      const symbols: string[] = [];

      for (let symbolIndex = 0; symbolIndex < 4; symbolIndex++) {
        const randomIndex = generateInt(
          0,
          availableSymbols.length - 1,
          ringIndex * 10 + symbolIndex,
        );
        symbols.push(availableSymbols[randomIndex]);
        availableSymbols.splice(randomIndex, 1); // Remove used symbol
      }

      const targetRotation = generateInt(0, 3, ringIndex + 100);

      grid.push({
        id: ringIndex,
        symbols,
        currentRotation: 0,
        targetRotation,
        matched: false,
      });
    }

    return grid;
  }, [generateInt]);

  // =========================================================================
  // STATE
  // =========================================================================

  const [rings, setRings] = useState<Grid>(initializeRings);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false); // Prevent double submission

  // =========================================================================
  // TIMER
  // =========================================================================

  useEffect(() => {
    if (!gameActive || isPending) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, isPending]);

  // =========================================================================
  // MATCH DETECTION (FIXED)
  // =========================================================================

  useEffect(() => {
    const updatedRings = rings.map((ring) => ({
      ...ring,
      matched: ring.currentRotation === ring.targetRotation,
    }));

    setRings(updatedRings);

    // FIXED: Only auto-submit when ALL rings matched AND game is active
    const matchedCount = updatedRings.filter((r) => r.matched).length;
    const allMatched = matchedCount === rings.length;

    if (allMatched && gameActive && !hasSubmitted && !isPending) {
      setHasSubmitted(true); // Prevent multiple submissions
      handleSubmit();
    }
  }, [rings.map((r) => r.currentRotation).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setHasSubmitted(false); // Reset submission flag
  };

  const rotateRing = useCallback(
    (ringId: number) => {
      if (!gameActive || isPending || hasSubmitted) return;

      setRings((prev) =>
        prev.map((ring) =>
          ring.id === ringId
            ? { ...ring, currentRotation: (ring.currentRotation + 1) % 4 }
            : ring,
        ),
      );
    },
    [gameActive, isPending, hasSubmitted],
  );

  const handleSubmit = () => {
    if (!startTime || hasSubmitted) return;

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const matchedCount = rings.filter((r) => r.matched).length;
    const matchPercentage = (matchedCount / rings.length) * 100;

    // Time bonus for completing quickly
    const timeBonus = timeRemaining > 0 ? (timeRemaining / timeLimit) * 20 : 0;

    const accuracy = Math.min(100, matchPercentage + timeBonus);
    const score = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(score),
      timeSpent: elapsedSeconds * 1000,
      timestamp: new Date(),
      metadata: {
        matchedRings: matchedCount,
        totalRings: rings.length,
        timeRemaining,
      },
    };

    setGameActive(false);
    onComplete(result);

    // Reset state for potential replay
    setTimeout(() => {
      setRings(initializeRings());
      setTimeRemaining(timeLimit);
      setStartTime(null);
      setHasSubmitted(false);
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
  // RENDER HELPERS
  // =========================================================================

  /**
   * FIXED: Get the symbol at the target rotation (for preview)
   */
  const getTargetSymbol = (ring: Ring): string => {
    return ring.symbols[ring.targetRotation];
  };

  const alignmentPercentage =
    (rings.filter((r) => r.matched).length / rings.length) * 100;

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Lattice Alignment
          </h3>
          {gameActive && (
            <Badge variant={timeRemaining < 15 ? "destructive" : "secondary"}>
              {timeRemaining}s
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {!gameActive &&
            !startTime &&
            "Rotate the rings to match the target pattern"}
          {gameActive && "Align all rings before time runs out"}
          {!gameActive && startTime && "Lattice alignment complete!"}
        </p>
      </div>

      {/* Alignment Progress */}
      {gameActive && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Alignment</span>
            <span>{Math.round(alignmentPercentage)}%</span>
          </div>
          <Progress value={alignmentPercentage} />
        </div>
      )}

      {/* FIXED: Target Pattern Preview */}
      {!gameActive && !startTime && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs font-medium text-center mb-3">
            Target Pattern:
          </p>
          <div className="flex justify-center gap-2">
            {rings.map((ring) => (
              <div
                key={ring.id}
                className="w-12 h-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-xl"
                title={`Ring ${ring.id + 1} target`}
              >
                {getTargetSymbol(ring)}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Match these symbols by rotating the rings below
          </p>
        </div>
      )}

      {/* Rings */}
      <div className="relative min-h-[300px] flex items-center justify-center">
        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  Submitting Result
                </p>
                <p className="text-xs text-muted-foreground">
                  Stabilizing lattice alignment...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={cn("space-y-4 w-full", isPending && "opacity-50")}>
          {rings.map((ring) => (
            <button
              key={ring.id}
              onClick={() => rotateRing(ring.id)}
              disabled={!gameActive || isPending || hasSubmitted}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all",
                "flex items-center justify-between",
                ring.matched
                  ? "border-green-500 bg-green-500/10"
                  : "border-border bg-card hover:border-primary/50",
                gameActive && !isPending && !hasSubmitted && "cursor-pointer",
              )}
            >
              {/* Ring Symbol Display - Show all 4 positions */}
              <div className="flex gap-2">
                {ring.symbols.map((symbol, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all",
                      index === ring.currentRotation
                        ? "border-primary bg-primary/20 scale-110"
                        : "border-border bg-muted/20 opacity-50",
                    )}
                  >
                    {symbol}
                  </div>
                ))}
              </div>

              {/* Match Indicator */}
              <div className="flex items-center gap-2">
                {gameActive && (
                  <span className="text-xs text-muted-foreground">
                    Target: {getTargetSymbol(ring)}
                  </span>
                )}
                {ring.matched ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {!gameActive && !startTime && (
        <Button
          size="lg"
          className="w-full"
          onClick={startGame}
          disabled={isPending}
        >
          <Zap className="mr-2 h-4 w-4" />
          Begin Alignment
        </Button>
      )}

      {gameActive && (
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={handleSubmit}
          disabled={isPending || hasSubmitted}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Submit Early
            </>
          )}
        </Button>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Compass className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-medium">How to Play:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Memorize the target pattern shown above</li>
              <li>Tap each ring to rotate it clockwise</li>
              <li>Match the highlighted symbol to the target</li>
              <li>Complete before time runs out!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
