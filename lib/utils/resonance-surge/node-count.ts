/**
 * Calculates daily Surge node count based on 7-day activity volume
 * Formula: BaseNodes + (ActivityScore / ScalingFactor)
 *
 * Ensures:
 * - Min 50 nodes (low activity periods)
 * - Max 200 nodes (prevents database bloat)
 * - Scales with player engagement
 */
export function calculateDailyNodeCount(totalActivityScore: number): number {
  const BASE_NODES = 50;
  const MAX_NODES = 200;
  const SCALING_FACTOR = 50000; // 1 node per 50k activity points

  const dynamicNodes = Math.floor(totalActivityScore / SCALING_FACTOR);
  const targetCount = BASE_NODES + dynamicNodes;

  return Math.max(BASE_NODES, Math.min(targetCount, MAX_NODES));
}

/**
 * Example scaling:
 * - 0 activity score → 50 nodes (baseline)
 * - 500k activity score → 60 nodes
 * - 2.5M activity score → 100 nodes
 * - 7.5M activity score → 200 nodes (cap)
 */
