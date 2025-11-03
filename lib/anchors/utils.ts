import { Decimal } from "@prisma/client/runtime/client";

/**
 * Calculate C_Base from the current phase's requiredPiFunding
 * C_Base = requiredPiFunding / 10, rounded to 2 decimal places
 */
export function calculateCBase(
  requiredPiFunding: Decimal | string | number
): Decimal {
  const base = new Decimal(requiredPiFunding).dividedBy(10);
  return base.toDecimalPlaces(2, Decimal.ROUND_DOWN);
}

/**
 * Calculate total anchor cost using the formula: C_Base + (A_G × 0.05)
 * @param requiredPiFunding - Phase's requiredPiFunding to derive C_Base
 * @param globalAnchorIndex - Global Anchor Index A_G
 * @returns Cost in Pi
 */
export function calculateAnchorCost(
  requiredPiFunding: Decimal | string | number,
  globalAnchorIndex: number
): Decimal {
  const cBase = calculateCBase(requiredPiFunding);
  const scarcityComponent = new Decimal(globalAnchorIndex).times(0.05);
  return cBase.plus(scarcityComponent).toDecimalPlaces(2, Decimal.ROUND_DOWN);
}
