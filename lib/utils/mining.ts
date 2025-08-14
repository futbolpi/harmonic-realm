// /lib/mining.ts

/**
 * Calculate miner shares earned for a session.
 */
export function calculateMinerShares(params: {
  baseYieldPerMinute: number; // NodeType.baseYieldPerMinute
  durationMinutes: number; // actualMinutes or lockInMinutes, whichever is higher
  upgradeBonusPct: number; // sum of upgrade.effectPct, e.g. 0.15 for +15%
  masteryBonusPct: number; // (mastery.level - 1) * 0.01, e.g. level 3 → 0.02
  miniTaskMultiplier: number; // e.g. 1.2 for +20%
  maxMiners: number; // NodeType.maxMiners
  activeMiners: number; // count of concurrent ACTIVE sessions
}): number {
  const lockedDuration = params.durationMinutes;
  const divisor = Math.max(1, Math.min(params.maxMiners, params.activeMiners));
  const rawShares =
    (params.baseYieldPerMinute *
      lockedDuration *
      (1 + params.upgradeBonusPct + params.masteryBonusPct) *
      params.miniTaskMultiplier) /
    divisor;

  return Math.max(0, Math.floor(rawShares));
}

/**
 * Calculate XP gained on mining completion.
 * Uses 1 XP/minute as base, scales by same bonuses as shares.
 */
export function calculateMiningXp(params: {
  durationMinutes: number;
  upgradeBonusPct: number;
  masteryBonusPct: number;
  miniTaskMultiplier: number;
}): number {
  const rawXp =
    params.durationMinutes *
    (1 + params.upgradeBonusPct + params.masteryBonusPct) *
    params.miniTaskMultiplier;

  return Math.max(0, Math.floor(rawXp));
}
