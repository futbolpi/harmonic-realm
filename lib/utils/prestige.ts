import type { PrestigeSource } from "../generated/prisma/enums";

export type AwardPrestigeInput = {
  guildId: string;
  amount: number;
  source: PrestigeSource;
  metadata: PrismaJson.PrestigeLogMetadata;
};

export type PrestigeTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond";

/**
 * Prestige decay calculation
 * Highly active guilds (10+ members): -0.5% per week
 * Low activity guilds (<10 members): -2% per week
 */
export const PRESTIGE_DECAY_HIGH_ACTIVITY = 0.005; // 0.5%
export const PRESTIGE_DECAY_LOW_ACTIVITY = 0.02; // 2%
export const PRESTIGE_ACTIVE_MEMBER_THRESHOLD = 10;

/**
 * Prestige multiplier calculation
 * Base: 1.0
 * Per level: +0.5%
 * Max: 1.5 (at level 100)
 */
export const PRESTIGE_MULTIPLIER_PER_LEVEL = 0.005;
export const MAX_PRESTIGE_LEVEL = 100;

/**
 * Prestige point thresholds
 * 1000 points = 1 level
 */
export const PRESTIGE_POINTS_PER_LEVEL = 1000;

/**
 * Prestige tier definitions
 */
export const PRESTIGE_TIERS = {
  Bronze: { minLevel: 0, maxLevel: 19 },
  Silver: { minLevel: 20, maxLevel: 39 },
  Gold: { minLevel: 40, maxLevel: 59 },
  Platinum: { minLevel: 60, maxLevel: 79 },
  Diamond: { minLevel: 80, maxLevel: 100 },
} as const;

/**
 * Prestige tier benefits
 */
export const TIER_BENEFITS = {
  Bronze: {
    memberCapBonus: 0,
    vaultCapacityBonus: 0,
    harvestSpeedBonus: 0,
  },
  Silver: {
    memberCapBonus: 5,
    vaultCapacityBonus: 0.05,
    harvestSpeedBonus: 0.02,
  },
  Gold: {
    memberCapBonus: 15,
    vaultCapacityBonus: 0.15,
    harvestSpeedBonus: 0.05,
  },
  Platinum: {
    memberCapBonus: 30,
    vaultCapacityBonus: 0.3,
    harvestSpeedBonus: 0.1,
  },
  Diamond: {
    memberCapBonus: 50,
    vaultCapacityBonus: 0.5,
    harvestSpeedBonus: 0.2,
  },
} as const;

/**
 * Calculate prestige multiplier bonus based on guild level
 * Level 1: 1.0x
 * Level 100: 1.5x (1 + 100 * 0.005)
 */
export function calculatePrestigeMultiplier(level: number): number {
  return (
    1 + Math.min(level, MAX_PRESTIGE_LEVEL) * PRESTIGE_MULTIPLIER_PER_LEVEL
  );
}

/**
 * Get prestige level from prestige points
 * 1000 points = 1 level
 */
export function getPrestigeLevelFromPoints(points: number): number {
  return Math.floor(points / PRESTIGE_POINTS_PER_LEVEL);
}

/**
 * Get points required for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * PRESTIGE_POINTS_PER_LEVEL;
}

/**
 * Get prestige progress percentage for current level
 */
export function getPrestigeProgressPercentage(
  prestigePoints: number,
  prestigeLevel: number,
): number {
  const currentLevelPoints = prestigeLevel * PRESTIGE_POINTS_PER_LEVEL;
  const nextLevelPoints = (prestigeLevel + 1) * PRESTIGE_POINTS_PER_LEVEL;
  const pointsInLevel = prestigePoints - currentLevelPoints;
  const pointsPerLevel = nextLevelPoints - currentLevelPoints;
  return Math.round((pointsInLevel / pointsPerLevel) * 100);
}

/**
 * Get prestige tier based on level
 */
export function getPrestigeTier(level: number): PrestigeTier {
  if (level >= 80) return "Diamond";
  if (level >= 60) return "Platinum";
  if (level >= 40) return "Gold";
  if (level >= 20) return "Silver";
  return "Bronze";
}

/**
 * Get prestige rewards for tier
 * Used for display and bonus calculations
 */
export function getTierRewards(tier: PrestigeTier) {
  return TIER_BENEFITS[tier];
}

/**
 * Calculate decay based on activity
 * Highly active (10+ members): -0.5% per week
 * Low activity (<10 members): -2% per week
 */
export function calculatePrestigeDecay(
  prestigePoints: number,
  activeMemberCount: number,
): number {
  const decayRate =
    activeMemberCount >= PRESTIGE_ACTIVE_MEMBER_THRESHOLD
      ? PRESTIGE_DECAY_HIGH_ACTIVITY
      : PRESTIGE_DECAY_LOW_ACTIVITY;
  return Math.floor(prestigePoints * decayRate);
}

export const TIER_COLORS: Record<
  PrestigeTier,
  { bg: string; border: string; text: string; glow: string }
> = {
  Bronze: {
    bg: "bg-amber-100 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-900 dark:text-amber-100",
    glow: "shadow-amber-500/20",
  },
  Silver: {
    bg: "bg-slate-100 dark:bg-slate-950/30",
    border: "border-slate-300 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-100",
    glow: "shadow-slate-500/20",
  },
  Gold: {
    bg: "bg-yellow-100 dark:bg-yellow-950/30",
    border: "border-yellow-400 dark:border-yellow-600",
    text: "text-yellow-900 dark:text-yellow-100",
    glow: "shadow-yellow-500/30",
  },
  Platinum: {
    bg: "bg-cyan-100 dark:bg-cyan-950/30",
    border: "border-cyan-400 dark:border-cyan-600",
    text: "text-cyan-900 dark:text-cyan-100",
    glow: "shadow-cyan-500/30",
  },
  Diamond: {
    bg: "bg-purple-100 dark:bg-purple-950/30",
    border: "border-purple-400 dark:border-purple-600",
    text: "text-purple-900 dark:text-purple-100",
    glow: "shadow-purple-500/30",
  },
};

export const TIER_ICONS: Record<PrestigeTier, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "👑",
};

export const TIER_LEVELS: Array<{
  tier: PrestigeTier;
  minLevel: number;
  maxLevel: number;
}> = [
  { tier: "Bronze", minLevel: 1, maxLevel: 19 },
  { tier: "Silver", minLevel: 20, maxLevel: 39 },
  { tier: "Gold", minLevel: 40, maxLevel: 59 },
  { tier: "Platinum", minLevel: 60, maxLevel: 79 },
  { tier: "Diamond", minLevel: 80, maxLevel: 100 },
];
