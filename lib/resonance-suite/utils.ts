/**
 * RESONANCE SUITE UTILITIES
 *
 * Helper functions for suite activities that don't fit into hooks
 * Provides reusable logic for common tasks
 */

import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { ActivityDifficulty, ScoreTier } from "@/lib/schema/resonance-suite";

// ============================================================================
// REWARD CALCULATIONS
// ============================================================================

/**
 * Get difficulty multiplier for rewards
 * Harder activities = higher rewards
 */
export function getDifficultyMultiplier(
  difficulty: ActivityDifficulty,
): number {
  const multipliers: Record<ActivityDifficulty, number> = {
    [ActivityDifficulty.EASY]: 0.8,
    [ActivityDifficulty.MEDIUM]: 1.0,
    [ActivityDifficulty.HARD]: 1.3,
    [ActivityDifficulty.EXTREME]: 1.7,
  };

  return multipliers[difficulty];
}

/**
 * Get rarity multiplier for rewards
 * Rarer nodes = higher rewards
 */
export function getRarityMultiplier(rarity: NodeTypeRarity): number {
  const multipliers: Record<NodeTypeRarity, number> = {
    Common: 1.0,
    Uncommon: 1.15,
    Rare: 1.3,
    Epic: 1.5,
    Legendary: 2.0,
  };

  return multipliers[rarity] || 1.0;
}

/**
 * Calculate final reward with all multipliers applied
 */
export function calculateFinalReward(
  baseReward: number,
  score: number,
  difficulty: ActivityDifficulty,
  rarity: NodeTypeRarity,
  extraMultipliers: number[] = [],
): number {
  let reward = baseReward;

  // Apply score scaling (0-100)
  reward *= score / 100;

  // Apply difficulty multiplier
  reward *= getDifficultyMultiplier(difficulty);

  // Apply rarity multiplier
  reward *= getRarityMultiplier(rarity);

  // Apply extra multipliers (competitive bonus, chamber boost, etc.)
  extraMultipliers.forEach((multiplier) => {
    reward *= multiplier;
  });

  return Math.max(0, reward);
}

// ============================================================================
// PROCEDURAL GENERATION HELPERS
// ============================================================================

/**
 * Seeded random number generator
 * Returns same value for same seed (deterministic)
 *
 * @param seed - Seed value
 * @returns Random value between 0 and 1
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generate a random value in range using seed
 *
 * @param seed - Seed for determinism
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @param offset - Optional offset to vary results with same seed
 */
export function seededRange(
  seed: number,
  min: number,
  max: number,
  offset: number = 0,
): number {
  const random = seededRandom(seed + offset);
  return min + random * (max - min);
}

/**
 * Generate a random integer in range using seed
 */
export function seededRangeInt(
  seed: number,
  min: number,
  max: number,
  offset: number = 0,
): number {
  return Math.floor(seededRange(seed, min, max + 1, offset));
}

// ============================================================================
// SCORE FORMATTING
// ============================================================================

/**
 * Format score for display
 *
 * @param score - Raw score (0-100)
 * @param decimals - Number of decimal places
 */
export function formatScore(score: number, decimals: number = 1): string {
  return score.toFixed(decimals);
}

/**
 * Get score tier (S, A, B, C, D, F)
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 95) return "S";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Get score color based on tier
 */
export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);

  const colors: Record<ScoreTier, string> = {
    S: "text-yellow-400", // Gold
    A: "text-green-400", // Green
    B: "text-blue-400", // Blue
    C: "text-orange-400", // Orange
    D: "text-red-400", // Red
    F: "text-gray-400", // Gray
  };

  return colors[tier] || colors.F;
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format milliseconds as MM:SS
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format milliseconds as human-readable duration
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that a score is within valid range
 */
export function isValidScore(score: number): boolean {
  return score >= 0 && score <= 100 && !isNaN(score);
}

/**
 * Clamp a score to valid range
 */
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// CANVAS UTILITIES
// ============================================================================

/**
 * Clear canvas and reset transform
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * Draw a sine wave on canvas
 */
export function drawSineWave(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number;
    height: number;
    frequency: number;
    amplitude: number;
    phase: number;
    color: string;
    lineWidth: number;
  },
): void {
  const { width, height, frequency, amplitude, phase, color, lineWidth } =
    options;
  const cy = height / 2;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let x = 0; x < width; x++) {
    const y = cy + Math.sin((x + phase) * 0.01 * (frequency / 40)) * amplitude;
    ctx.lineTo(x, y);
  }

  ctx.stroke();
}

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Calculate progress toward next streak milestone
 */
export function getStreakProgress(
  currentStreak: number,
  milestoneInterval: number = 5,
): {
  progress: number;
  remaining: number;
  nextMilestone: number;
} {
  const progress = currentStreak % milestoneInterval;
  const remaining = milestoneInterval - progress;
  const nextMilestone = currentStreak + remaining;

  return {
    progress,
    remaining,
    nextMilestone,
  };
}

/**
 * Check if streak qualifies for milestone reward
 */
export function isStreakMilestone(
  currentStreak: number,
  milestoneInterval: number = 5,
): boolean {
  return currentStreak > 0 && currentStreak % milestoneInterval === 0;
}
