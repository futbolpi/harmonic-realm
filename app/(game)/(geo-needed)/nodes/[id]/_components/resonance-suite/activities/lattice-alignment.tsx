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

  // Initialize rings with procedural patterns and targets
  const initializeRings = (): Ring[] => {
    return Array.from({ length: 4 }, (_, ringIndex) => {
      // Generate unique symbols for each ring
      const symbols = Array.from(
        { length: 4 },
        (_, symbolIndex) =>
          SYMBOLS[
            generateInt(0, SYMBOLS.length - 1, ringIndex * 10 + symbolIndex)
          ],
      );

      return {
        id: ringIndex,
        symbols,
        currentRotation: 0,
        targetRotation: generateInt(0, 3, ringIndex + 100),
        matched: false,
      };
    });
  };

  // =========================================================================
  // STATE
  // =========================================================================

  const [rings, setRings] = useState<Ring[]>(initializeRings);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

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
  // MATCH DETECTION
  // =========================================================================

  useEffect(() => {
    const updatedRings = rings.map((ring) => ({
      ...ring,
      matched: ring.currentRotation === ring.targetRotation,
    }));
    setRings(updatedRings);

    // Check if all matched
    if (updatedRings.every((r) => r.matched) && gameActive) {
      handleSubmit();
    }
  }, [rings.map((r) => r.currentRotation).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
  };

  const rotateRing = useCallback(
    (ringId: number) => {
      if (!gameActive || isPending) return;

      setRings((prev) =>
        prev.map((ring) =>
          ring.id === ringId
            ? { ...ring, currentRotation: (ring.currentRotation + 1) % 4 }
            : ring,
        ),
      );
    },
    [gameActive, isPending],
  );

  const handleSubmit = () => {
    if (!startTime) return;

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
        // allMatched: matchedCount === rings.length,
      },
    };

    setGameActive(false);
    onComplete(result);

    // Reset state for potential replay
    setTimeout(() => {
      setRings(initializeRings());
      setTimeRemaining(timeLimit);
      setStartTime(null);
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

  const getSymbolAtPosition = (ring: Ring, position: number): string => {
    return ring.symbols[position];
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

      {/* Target Pattern (shown before game starts) */}
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
              >
                {getSymbolAtPosition(ring, ring.targetRotation)}
              </div>
            ))}
          </div>
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
              disabled={!gameActive || isPending}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all",
                "flex items-center justify-between",
                ring.matched
                  ? "border-green-500 bg-green-500/10"
                  : "border-border bg-card hover:border-primary/50",
                gameActive && !isPending && "cursor-pointer",
              )}
            >
              {/* Ring Symbol Display */}
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
              <div>
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
          disabled={isPending}
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
              <li>Memorize the target pattern before starting</li>
              <li>Tap each ring to rotate it clockwise</li>
              <li>Match all rings to the target symbols</li>
              <li>Complete before time runs out!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
