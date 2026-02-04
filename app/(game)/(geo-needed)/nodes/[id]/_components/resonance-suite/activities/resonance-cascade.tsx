/**
 * RESONANCE CASCADE - Chain Reaction Strategy Game
 *
 * LORE ALIGNMENT:
 * Nodes exist in a harmonic field where vibrations spread through connected nodes.
 * Players trigger cascading resonances by activating nodes in the correct sequence.
 * The Pi-derived frequency determines optimal cascade patterns.
 *
 * GAMEPLAY:
 * - 3x3 grid of mini-nodes
 * - Each node has a charge level (0-3)
 * - Tapping a node increases its charge and adjacent nodes
 * - Nodes at charge 3 "cascade" (reset + boost neighbors)
 * - Goal: Create largest possible cascade chain
 *
 * MECHANICS:
 * - Procedural starting configuration from node seed
 * - Strategic planning required for optimal chains
 * - Cascade multipliers for chain reactions
 * - Limited moves based on node rarity
 * - Visual particle effects for cascades
 *
 * UX FEATURES:
 * - Color-coded charge levels
 * - Cascade animations with particle bursts
 * - Move counter and score display
 * - Undo last move (1 undo available)
 * - Loading state during submission
 */

"use client";

import { useState, useCallback } from "react";
import { Sparkles, RotateCcw, Zap, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
} from "@/lib/resonance-suite/hooks";

interface Node {
  id: number;
  charge: number; // 0-3
  cascaded: boolean;
}

type Grid = Node[][];

export default function ResonanceCascade({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateInt } = useProceduralGeneration(nodeFrequencySeed, 0.2);

  const maxMoves =
    {
      Common: 12,
      Uncommon: 10,
      Rare: 9,
      Epic: 8,
      Legendary: 7,
    }[nodeRarity] || 12;

  // Initialize grid with procedural starting charges
  const initializeGrid = (): Grid => {
    const grid: Grid = [];
    let id = 0;
    for (let row = 0; row < 3; row++) {
      const rowNodes: Node[] = [];
      for (let col = 0; col < 3; col++) {
        rowNodes.push({
          id: id++,
          charge: generateInt(0, 2, id), // Start with 0-1 charge
          cascaded: false,
        });
      }
      grid.push(rowNodes);
    }
    return grid;
  };

  // =========================================================================
  // STATE
  // =========================================================================

  const [grid, setGrid] = useState<Grid>(initializeGrid);
  const [moves, setMoves] = useState(0);
  const [cascadeCount, setCascadeCount] = useState(0);
  const [previousGrid, setPreviousGrid] = useState<Grid | null>(null);
  const [undoUsed, setUndoUsed] = useState(false);
  const [score, setScore] = useState(0);

  // =========================================================================
  // GAME LOGIC
  // =========================================================================

  const activateNode = useCallback(
    (row: number, col: number) => {
      if (isPending || moves >= maxMoves) return;

      // Save state for undo
      setPreviousGrid(JSON.parse(JSON.stringify(grid)));

      const newGrid = JSON.parse(JSON.stringify(grid)) as Grid;
      let cascades = 0;

      // Increase target node and adjacent nodes
      const positions = [
        [row, col], // Center
        [row - 1, col], // Up
        [row + 1, col], // Down
        [row, col - 1], // Left
        [row, col + 1], // Right
      ];

      positions.forEach(([r, c]) => {
        if (r >= 0 && r < 3 && c >= 0 && c < 3) {
          newGrid[r][c].charge++;

          // Check for cascade (charge >= 3)
          if (newGrid[r][c].charge >= 3) {
            newGrid[r][c].charge = 0;
            newGrid[r][c].cascaded = true;
            cascades++;

            // Boost all adjacent nodes again (chain reaction)
            const adjacent = [
              [r - 1, c],
              [r + 1, c],
              [r, c - 1],
              [r, c + 1],
            ];
            adjacent.forEach(([ar, ac]) => {
              if (ar >= 0 && ar < 3 && ac >= 0 && ac < 3) {
                newGrid[ar][ac].charge = Math.min(
                  3,
                  newGrid[ar][ac].charge + 1,
                );
              }
            });
          }
        }
      });

      setGrid(newGrid);
      setMoves((prev) => prev + 1);
      setCascadeCount((prev) => prev + cascades);
      setScore((prev) => prev + cascades * 100 + 10); // 100 per cascade, 10 per move

      // Clear cascaded flag after animation
      setTimeout(() => {
        setGrid((currentGrid) =>
          currentGrid.map((row) =>
            row.map((node) => ({ ...node, cascaded: false })),
          ),
        );
      }, 500);
    },
    [grid, moves, maxMoves, isPending],
  );

  const undo = () => {
    if (previousGrid && !undoUsed) {
      setGrid(previousGrid);
      setMoves((prev) => prev - 1);
      setUndoUsed(true);
    }
  };

  const handleSubmit = () => {
    // Score based on cascades and efficiency
    const cascadeScore = (cascadeCount / maxMoves) * 100;
    const efficiencyBonus =
      moves < maxMoves ? ((maxMoves - moves) / maxMoves) * 20 : 0;

    const accuracy = Math.min(100, cascadeScore + efficiencyBonus);
    const finalScore = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score: finalScore,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(finalScore),
      timestamp: new Date(),
      metadata: {
        cascadeCount,
        movesUsed: moves,
        maxMoves,
        totalScore: score,
      },
    };

    onComplete(result);

    // Reset state for potential replay
    setTimeout(() => {
      setGrid(initializeGrid());
      setMoves(0);
      setCascadeCount(0);
      setPreviousGrid(null);
      setUndoUsed(false);
      setScore(0);
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

  const getChargeColor = (charge: number): string => {
    switch (charge) {
      case 0:
        return "bg-slate-700 border-slate-600";
      case 1:
        return "bg-blue-600 border-blue-500";
      case 2:
        return "bg-purple-600 border-purple-500";
      case 3:
        return "bg-pink-600 border-pink-500 animate-pulse";
      default:
        return "bg-slate-700 border-slate-600";
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resonance Cascade
          </h3>
          <Badge variant="secondary">
            {moves}/{maxMoves} Moves
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Trigger chain reactions to maximize resonance energy
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
          <div className="font-bold text-blue-400">{cascadeCount}</div>
          <div className="text-muted-foreground">Cascades</div>
        </div>
        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
          <div className="font-bold text-purple-400">{score}</div>
          <div className="text-muted-foreground">Score</div>
        </div>
        <div className="p-2 rounded bg-pink-500/10 border border-pink-500/30">
          <div className="font-bold text-pink-400">{maxMoves - moves}</div>
          <div className="text-muted-foreground">Left</div>
        </div>
      </div>

      {/* Grid */}
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
                  Calculating cascade resonance...
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn("grid grid-cols-3 gap-3", isPending && "opacity-50")}
        >
          {grid.map((row, rowIndex) =>
            row.map((node, colIndex) => (
              <button
                key={node.id}
                onClick={() => activateNode(rowIndex, colIndex)}
                disabled={isPending || moves >= maxMoves}
                className={cn(
                  "aspect-square rounded-lg border-2 transition-all relative",
                  "flex items-center justify-center text-2xl font-bold",
                  getChargeColor(node.charge),
                  node.cascaded && "animate-ping",
                  !isPending &&
                    moves < maxMoves &&
                    "hover:scale-105 cursor-pointer",
                )}
              >
                {node.charge > 0 && (
                  <span className="text-white drop-shadow-lg">
                    {node.charge}
                  </span>
                )}
                {node.cascaded && (
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-yellow-400 animate-spin" />
                )}
              </button>
            )),
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={undo}
          disabled={!previousGrid || undoUsed || isPending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Undo {undoUsed && "(Used)"}
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={isPending || moves === 0}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Submit
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-medium">How to Play:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Tap nodes to increase charge (+ adjacent nodes)</li>
              <li>Charge 3 triggers CASCADE (resets + boosts neighbors)</li>
              <li>Chain cascades together for mega points</li>
              <li>Plan ahead - limited moves available!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
