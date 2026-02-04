/**
 * HARMONIC ECHO - Rhythm Timing Minigame
 *
 * LORE ALIGNMENT:
 * The node's frequency creates harmonic pulses that ripple through the Lattice.
 * Players must synchronize with these pulses by tapping at the perfect moment.
 * Each successful echo strengthens the harmonic resonance.
 *
 * GAMEPLAY:
 * - Visual pulse waves emanate from center
 * - Tap when pulse reaches the target ring
 * - Timing accuracy determines score
 * - Multiple pulses create combo multipliers
 * - Node frequency affects pulse speed
 *
 * MECHANICS:
 * - Procedural pulse generation based on node seed
 * - Dynamic difficulty: rarer nodes = faster pulses
 * - Perfect hits glow and award bonus points
 * - Combo system for consecutive perfect hits
 * - Miss tolerance based on node rarity
 *
 * UX FEATURES:
 * - Visual feedback for hit quality (Perfect/Good/Miss)
 * - Audio-visual pulse animations
 * - Combo counter with multiplier display
 * - Loading state with backdrop overlay
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Radio, Zap, Target, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SuiteActivityProps, GameResult } from "@/lib/schema/resonance-suite";
import {
  useProceduralGeneration,
  useActivityScoring,
} from "@/lib/resonance-suite/hooks";

// Game states
enum GameState {
  READY = "READY",
  PLAYING = "PLAYING",
  COMPLETE = "COMPLETE",
}

// Hit quality ratings
enum HitQuality {
  PERFECT = "PERFECT",
  GOOD = "GOOD",
  MISS = "MISS",
}

interface Pulse {
  id: number;
  startTime: number;
  radius: number;
  active: boolean;
}

interface Hit {
  quality: HitQuality;
  timestamp: number;
}

export default function HarmonicEcho({
  nodeRarity,
  nodeFrequencySeed,
  isPending,
  onComplete,
}: SuiteActivityProps<GameResult>) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const gameStartTime = useRef<number>(0);
  const nextPulseId = useRef(0);

  // =========================================================================
  // PROCEDURAL GENERATION
  // =========================================================================

  const { generateValue } = useProceduralGeneration(nodeFrequencySeed, 0.15);

  // Difficulty scales with rarity
  const config = useMemo(
    () => ({
      totalPulses:
        {
          Common: 8,
          Uncommon: 10,
          Rare: 12,
          Epic: 14,
          Legendary: 16,
        }[nodeRarity] || 8,

      pulseSpeed:
        {
          Common: 1.5,
          Uncommon: 1.7,
          Rare: 2.0,
          Epic: 2.3,
          Legendary: 2.6,
        }[nodeRarity] || 1.5,

      perfectThreshold: 15, // pixels
      goodThreshold: 30,
    }),
    [nodeRarity],
  );

  // =========================================================================
  // CANVAS ANIMATION
  // =========================================================================

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const targetRadius = 80;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw target ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw pulses
      pulses.forEach((pulse) => {
        if (!pulse.active) return;

        const elapsed = Date.now() - pulse.startTime;
        const radius = (elapsed / 1000) * config.pulseSpeed * 30; // Convert to pixels/second

        // Fade out as it expands beyond target
        const distanceFromTarget = Math.abs(radius - targetRadius);
        const alpha =
          radius < targetRadius + 50
            ? 0.8
            : Math.max(0, 1 - distanceFromTarget / 100);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`; // Purple
        ctx.lineWidth = 3;
        ctx.stroke();

        // Check if pulse should be deactivated
        if (radius > 200) {
          setPulses((prev) =>
            prev.map((p) => (p.id === pulse.id ? { ...p, active: false } : p)),
          );
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, pulses, config.pulseSpeed]);

  // =========================================================================
  // GAME LOGIC
  // =========================================================================

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setHits([]);
    setCombo(0);
    setMaxCombo(0);
    gameStartTime.current = Date.now();

    // Spawn pulses at intervals
    const interval = setInterval(
      () => {
        if (pulses.filter((p) => p.active).length < config.totalPulses) {
          setPulses((prev) => [
            ...prev,
            {
              id: nextPulseId.current++,
              startTime: Date.now(),
              radius: 0,
              active: true,
            },
          ]);
        }
      },
      generateValue(1500, 2500, nextPulseId.current),
    );

    // Auto-complete after all pulses
    setTimeout(() => {
      clearInterval(interval);
      setTimeout(() => {
        if (gameState === GameState.PLAYING) {
          finishGame();
        }
      }, 3000);
    }, config.totalPulses * 2000);
  };

  const handleTap = useCallback(() => {
    if (gameState !== GameState.PLAYING || isPending) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const targetRadius = 80;

    // Find closest pulse to target
    const activePulses = pulses.filter((p) => p.active);
    if (activePulses.length === 0) return;

    const closestPulse = activePulses.reduce((closest, pulse) => {
      const elapsed = Date.now() - pulse.startTime;
      const radius = (elapsed / 1000) * config.pulseSpeed * 30;
      const distance = Math.abs(radius - targetRadius);

      const closestElapsed = Date.now() - closest.startTime;
      const closestRadius = (closestElapsed / 1000) * config.pulseSpeed * 30;
      const closestDistance = Math.abs(closestRadius - targetRadius);

      return distance < closestDistance ? pulse : closest;
    });

    const elapsed = Date.now() - closestPulse.startTime;
    const radius = (elapsed / 1000) * config.pulseSpeed * 30;
    const distance = Math.abs(radius - targetRadius);

    // Determine hit quality
    let quality: HitQuality;
    if (distance <= config.perfectThreshold) {
      quality = HitQuality.PERFECT;
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
    } else if (distance <= config.goodThreshold) {
      quality = HitQuality.GOOD;
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
    } else {
      quality = HitQuality.MISS;
      setCombo(0);
    }

    setHits((prev) => [...prev, { quality, timestamp: Date.now() }]);

    // Deactivate pulse
    setPulses((prev) =>
      prev.map((p) => (p.id === closestPulse.id ? { ...p, active: false } : p)),
    );
  }, [gameState, pulses, config, isPending]);

  const finishGame = () => {
    setGameState(GameState.COMPLETE);
    calculateScore();
  };

  // =========================================================================
  // SCORING
  // =========================================================================

  const { scoreFromAccuracy, isPerfectScore } = useActivityScoring(
    { baseRewardMultiplier: 1.0 },
    nodeRarity,
  );

  const calculateScore = () => {
    const perfectHits = hits.filter(
      (h) => h.quality === HitQuality.PERFECT,
    ).length;
    const goodHits = hits.filter((h) => h.quality === HitQuality.GOOD).length;
    const totalAttempts = config.totalPulses;

    // Scoring formula: Perfect = 100%, Good = 70%, Miss = 0%
    const rawScore = (perfectHits * 100 + goodHits * 70) / totalAttempts;
    const accuracy = Math.min(100, rawScore);
    const score = scoreFromAccuracy(accuracy);

    const result: GameResult = {
      score,
      accuracy,
      completed: true,
      perfectScore: isPerfectScore(score),
      timestamp: new Date(),
      metadata: {
        perfectHits,
        goodHits,
        missedHits: totalAttempts - hits.length,
        maxCombo,
        totalPulses: config.totalPulses,
      },
    };

    onComplete(result);

    // Reset state for potential replay
    setTimeout(() => {
      setGameState(GameState.READY);
      setPulses([]);
      setHits([]);
      setCombo(0);
      setMaxCombo(0);
      nextPulseId.current = 0;
    }, 500);
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  const progress = (hits.length / config.totalPulses) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Harmonic Echo
          </h3>
          <Badge variant="secondary">
            {gameState === GameState.READY && "Ready"}
            {gameState === GameState.PLAYING &&
              `${hits.length}/${config.totalPulses}`}
            {gameState === GameState.COMPLETE && "Complete"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {gameState === GameState.READY &&
            "Tap when the pulse reaches the target ring"}
          {gameState === GameState.PLAYING &&
            "Feel the rhythm of the node's frequency"}
          {gameState === GameState.COMPLETE && "Harmonic resonance stabilized!"}
        </p>
      </div>

      {/* Progress & Combo */}
      {gameState === GameState.PLAYING && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="flex items-center gap-2">
              {combo > 0 && (
                <span className="text-primary font-bold animate-pulse">
                  {combo}x Combo!
                </span>
              )}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Canvas */}
      <div className="relative aspect-square w-full max-w-sm mx-auto rounded-lg border border-border bg-black/40 overflow-hidden">
        {/* Loading Overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">
                  Submitting Result
                </p>
                <p className="text-xs text-muted-foreground">
                  Calculating harmonic resonance...
                </p>
              </div>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-full cursor-pointer"
          onClick={handleTap}
        />

        {/* Tap Hint */}
        {gameState === GameState.PLAYING && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <Target className="h-6 w-6 text-cyan-400 mx-auto animate-pulse" />
          </div>
        )}
      </div>

      {/* Stats Display */}
      {gameState === GameState.PLAYING && hits.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
            <div className="font-bold text-green-400">
              {hits.filter((h) => h.quality === HitQuality.PERFECT).length}
            </div>
            <div className="text-muted-foreground">Perfect</div>
          </div>
          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
            <div className="font-bold text-blue-400">
              {hits.filter((h) => h.quality === HitQuality.GOOD).length}
            </div>
            <div className="text-muted-foreground">Good</div>
          </div>
          <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
            <div className="font-bold text-purple-400">{maxCombo}</div>
            <div className="text-muted-foreground">Max Combo</div>
          </div>
        </div>
      )}

      {/* Controls */}
      {gameState === GameState.READY && (
        <Button
          size="lg"
          className="w-full"
          onClick={startGame}
          disabled={isPending}
        >
          <Zap className="mr-2 h-4 w-4" />
          Start Resonance
        </Button>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Radio className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-medium">How to Play:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>Watch for purple pulses from the center</li>
              <li>Tap when pulse reaches the cyan ring</li>
              <li>Perfect timing awards max points</li>
              <li>Build combos for bonus rewards!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
