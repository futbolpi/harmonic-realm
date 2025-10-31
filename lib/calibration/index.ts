import Decimal from "decimal.js";

/**
 * Pi digits up to 100 decimal places
 * Used for calculating required Pi funding based on precision index
 */
const PI_DIGITS =
  "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

/**
 * Calculate the required Pi funding based on the current phase's piDigitsIndex
 *
 * Formula: R = (Pi digits up to N decimal places) × 10^(N-1)
 *
 * Examples:
 * - Index 2: 3.14 × 10^1 = 31.4 Pi
 * - Index 3: 3.141 × 10^2 = 314.1 Pi
 * - Index 4: 3.1415 × 10^3 = 3141.5 Pi
 *
 * @param index - The piDigitsIndex from GamePhase (number of decimal places)
 * @returns The required Pi funding as a Decimal
 */
export function calculatePiCost(index: number): Decimal {
  if (index < 1 || index > 100) {
    throw new Error(
      `Invalid piDigitsIndex: ${index}. Must be between 1 and 100.`
    );
  }

  // Extract Pi digits up to the specified decimal places
  // Remove the decimal point and take the first (index + 1) digits
  const piDigitsOnly = PI_DIGITS.replace(".", "");

  // Insert decimal point at position 1 to get the Pi value
  const piValue = piDigitsOnly[0] + "." + piDigitsOnly.substring(1, index + 1);

  // Calculate the scaling factor: 10^(index - 1)
  const scaleFactor = Math.pow(10, index - 1);

  // Calculate: Pi value × 10^(index - 1)
  const piDecimal = new Decimal(piValue);
  const result = piDecimal.times(new Decimal(scaleFactor));

  return result;
}

/**
 * Calculate the Amplified Resonance Multiplier (N_spawn)
 *
 * Formula: N_spawn = Base Nodes × floor(sqrt(A_S × F_S))
 *
 * @param activityScore - Activity Score (A_S) measuring ecosystem health
 * @param fundingScale - Funding Scale (F_S) = log10(requiredPiFunding)
 * @param baseNodes - Base number of nodes (default: 10)
 * @returns Number of nodes to spawn
 */
export function calculateNodeSpawn(
  activityScore: number,
  fundingScale: number,
  baseNodes = 10
): number {
  const resonanceMultiplier = Math.sqrt(activityScore * fundingScale);
  const nodeCount = baseNodes * Math.floor(resonanceMultiplier);

  return Math.max(nodeCount, baseNodes); // Ensure at least baseNodes
}

/**
 * Calculate the Funding Scale (F_S)
 * F_S = log10(requiredPiFunding)
 *
 * @param requiredPiFunding - The required Pi funding amount
 * @returns The funding scale value
 */
export function calculateFundingScale(requiredPiFunding: Decimal): number {
  const fundingValue = requiredPiFunding.toNumber();
  return Math.log10(fundingValue);
}

/**
 * Calculate activity score based on ecosystem metrics
 *
 * Formula: A_S = (0.7 × Mining Intensity) + (0.3 × Node Utilization)
 *
 * @param miningIntensity - Current mining intensity (0-10 scale)
 * @param nodeUtilization - Node utilization percentage (0-100)
 * @returns Activity score
 */
export function calculateActivityScore(
  miningIntensity: number,
  nodeUtilization: number
): number {
  // Normalize nodeUtilization to 0-10 scale
  const normalizedUtilization = (nodeUtilization / 100) * 10;

  const activityScore = 0.7 * miningIntensity + 0.3 * normalizedUtilization;

  return Math.max(activityScore, 0.1); // Ensure minimum activity score
}
