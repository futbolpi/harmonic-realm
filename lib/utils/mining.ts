// /lib/mining.ts

/**
 * Calculate miner shares earned for a session.
 * @param baseYieldPerMinute NodeType.baseYieldPerMinute
 * @param durationMinutes NodeType.lockInMinutes
 * @param upgradeBonusPct sum of upgrade.effectPct, e.g. 0.15 for +15%
 * @param masteryBonusPct (mastery.level - 1) * 0.01, e.g. level 3 → 0.02
 * @param miniTaskMultiplier e.g. 1.2 for +20%
 * @param maxMiners NodeType.maxMiners
 * @param activeMiners count of COMPLETED sessions
 * @returns shares earned
 */
export function calculateMinerShares(params: {
  baseYieldPerMinute: number;
  durationMinutes: number;
  upgradeBonusPct: number;
  masteryBonusPct: number;
  miniTaskMultiplier: number;
  maxMiners: number;
  activeMiners: number;
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
 * Uses 1 XP/minute as base.
 * @param durationMinutes NodeType.lockInMinutes
 * @param upgradeBonusPct sum of upgrade.effectPct, e.g. 0.15 for +15%
 * @param masteryBonusPct (mastery.level - 1) * 0.01, e.g. level 3 → 0.02
 * @param miniTaskMultiplier e.g. 1.2 for +20%
 * @returns xp earned
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
