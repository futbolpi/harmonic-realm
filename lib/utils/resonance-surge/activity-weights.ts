export const ACTIVITY_WEIGHTS = {
  // High-commitment activities (permanent world changes)
  ANCHORING: 1000, // 1 Anchor = 1000 points (major Pi spend)
  CALIBRATION: 500, // 1 Calibration contribution = 500 points (community Pi)
  LORE_STAKING: 300, // 1 Lore stake = 300 points (cultural investment)

  // Medium-commitment (session-based)
  MINING: 50, // 1 completed mining session = 50 points
  CHAMBER_MAINTENANCE: 25, // 1 chamber upkeep = 25 points (RES sink)
  DRIFTING: 25, // 1 Node relocation = 25 points (RES sink) for original location

  // Low-commitment (daily engagement)
  TUNING: 10, // 1 tuning session = 10 points
} as const;

/**
 * Pi-based activities scale by amount spent (1:1 multiplier)
 * Example: 5 Pi Calibration stake = 500 × 5 = 2,500 points
 */
export function calculateActivityScore(
  activityType: keyof typeof ACTIVITY_WEIGHTS,
  quantity: number = 1,
  piAmount?: number,
): number {
  const baseWeight = ACTIVITY_WEIGHTS[activityType];

  // Scale Pi-based activities by amount
  if (
    piAmount &&
    ["ANCHORING", "CALIBRATION", "LORE_STAKING"].includes(activityType)
  ) {
    return baseWeight * piAmount;
  }

  return baseWeight * quantity;
}
