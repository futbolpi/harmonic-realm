/**
 * PATTERN MEMORY - Memory Matching Minigame
 *
 * EXAMPLE FUTURE GAME (Not yet enabled in registry)
 *
 * This file demonstrates how easy it is to add new activities to the suite.
 * To enable this game, simply uncomment its entry in registry.tsx
 *
 * GAMEPLAY:
 * - Players memorize a sequence of nodes that light up
 * - Must replay the sequence correctly
 * - Sequence length increases with node rarity
 * - Accuracy based on how many steps they get right
 *
 * MECHANICS:
 * - Uses procedural generation for deterministic sequences
 * - Node rarity determines difficulty (Common: 4 steps, Legendary: 8 steps)
 * - Players have limited time to memorize
 * - Visual and audio feedback (can be added)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, Zap, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
  useActivityTimer,
} from "@/lib/resonance-suite/hooks";

// Game states
enum GameState {
  MEMORIZE = "MEMORIZE",
  REPLAY = "REPLAY",
  RESULT = "RESULT",
}

export default function PatternMemory({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [gameState, setGameState] = useState<GameState>(GameState.MEMORIZE);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [showingSequence, setShowingSequence] = useState(false);

  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateInt } = useProceduralGeneration(nodeFrequencySeed, 0.1);

  /**
   * Generate sequence based on node rarity
   * Common: 4 steps, Uncommon: 5, Rare: 6, Epic: 7, Legendary: 8
   */
  const sequenceLength =
    {
      Common: 4,
      Uncommon: 5,
      Rare: 6,
      Epic: 7,
      Legendary: 8,
    }[nodeRarity] || 4;

  // Generate deterministic sequence
  useEffect(() => {
    const seq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      seq.push(generateInt(0, 8, i)); // 9 nodes (0-8)
    }
    setSequence(seq);
  }, [sequenceLength, generateInt]);

  // =========================================================================
  // TIMER
  // =========================================================================

  const memorizeTime = sequenceLength * 1000; // 1 second per step
  const { remainingMs, start, reset } = useActivityTimer(
    memorizeTime,
    () => setGameState(GameState.REPLAY), // Auto-transition
  );

  // =========================================================================
  // SEQUENCE DISPLAY
  // =========================================================================

  /**
   * Show sequence to player
   */
  const showSequence = useCallback(async () => {
    setShowingSequence(true);

    for (let i = 0; i < sequence.length; i++) {
      setActiveNode(sequence[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveNode(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setShowingSequence(false);
    start(); // Start timer after showing
  }, [sequence, start]);

  useEffect(() => {
    if (gameState === GameState.MEMORIZE && sequence.length > 0) {
      showSequence();
    }
  }, [gameState, sequence, showSequence]);

  // =========================================================================
  // USER INPUT
  // =========================================================================

  const handleNodeClick = (nodeIndex: number) => {
    if (gameState !== GameState.REPLAY || showingSequence || isPending) return;

    const newUserSequence = [...userSequence, nodeIndex];
    setUserSequence(newUserSequence);

    // Flash node
    setActiveNode(nodeIndex);
    setTimeout(() => setActiveNode(null), 300);

    // Check if complete
    if (newUserSequence.length === sequence.length) {
      calculateScore(newUserSequence);
    }
  };

  // =========================================================================
  // SCORING
  // =========================================================================

  const { scoreFromAccuracy, isPerfectScore } = useActivityScoring(
    { baseRewardMultiplier: 1.0 },
    nodeRarity,
  );

  const calculateScore = (playerSequence: number[]) => {
    // Count correct matches
    let correctCount = 0;
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === playerSequence[i]) {
        correctCount++;
      }
    }

    const accuracy = (correctCount / sequence.length) * 100;
    const score = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(score),
      timestamp: new Date(),
      metadata: {
        sequenceLength,
        correctCount,
        timeRemaining: remainingMs,
      },
    };

    setGameState(GameState.RESULT);
    setTimeout(() => {
      onComplete(result);
      // Reset state for potential replay
      setTimeout(() => {
        setGameState(GameState.MEMORIZE);
        setUserSequence([]);
        setActiveNode(null);
        setShowingSequence(false);
        reset();
      }, 500);
    }, 1500); // Brief delay to show result
    setTimeout(() => onComplete(result), 1500); // Brief delay to show result
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  const progress =
    ((sequenceLength - userSequence.length) / sequenceLength) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Pattern Memory
          </h3>
          <Badge variant="secondary">
            {gameState === GameState.MEMORIZE && "Memorize"}
            {gameState === GameState.REPLAY && "Your Turn"}
            {gameState === GameState.RESULT && "Complete!"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {gameState === GameState.MEMORIZE &&
            "Watch the sequence carefully..."}
          {gameState === GameState.REPLAY && "Repeat the pattern you saw"}
          {gameState === GameState.RESULT && "Calculating results..."}
        </p>
      </div>

      {/* Timer (during replay) */}
      {gameState === GameState.REPLAY && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Time Remaining</span>
            <span>{(remainingMs / 1000).toFixed(1)}s</span>
          </div>
          <Progress value={(remainingMs / memorizeTime) * 100} />
        </div>
      )}

      {/* Progress (during replay) */}
      {gameState === GameState.REPLAY && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>
              {userSequence.length} / {sequenceLength}
            </span>
          </div>
          <Progress value={100 - progress} />
        </div>
      )}

      {/* Node Grid */}
      <div className="relative">
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
                  Calculating rewards and bonuses...
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            "grid grid-cols-3 gap-3 transition-opacity",
            isPending && "opacity-50",
          )}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((nodeIndex) => (
            <button
              key={nodeIndex}
              onClick={() => handleNodeClick(nodeIndex)}
              disabled={
                gameState !== GameState.REPLAY || showingSequence || isPending
              }
              className={cn(
                "aspect-square rounded-lg border-2 transition-all",
                "flex items-center justify-center text-2xl font-bold",
                activeNode === nodeIndex
                  ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg"
                  : "bg-card border-border hover:border-primary/50",
                gameState === GameState.REPLAY && !showingSequence && !isPending
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60",
              )}
            >
              {nodeIndex + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-medium">How to Play:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Watch the nodes light up in sequence</li>
              <li>Memorize the pattern</li>
              <li>Tap the nodes in the same order</li>
              <li>Perfect recall = maximum rewards!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
