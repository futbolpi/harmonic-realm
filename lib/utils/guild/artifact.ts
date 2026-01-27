import type { ArtifactEffectType } from "@/lib/generated/prisma/enums";

/**
 * Artifact slot capacity by vault level
 */
export function getArtifactSlots(vaultLevel: number): number {
  if (vaultLevel >= 10) return 5;
  if (vaultLevel >= 6) return 3;
  if (vaultLevel >= 2) return 2;
  return 1;
}

/**
 * Format artifact effect for display
 */
export function formatArtifactEffect(
  effectType: ArtifactEffectType,
  value: number
): string {
  const percentage = Math.abs(value) * 100;

  const effectNames: Record<ArtifactEffectType, string> = {
    SHAREPOINT_BONUS: `+${percentage.toFixed(1)}% Share Points`,
    TUNING_QUALITY: `+${percentage.toFixed(1)}% Perfect Tune Chance`,
    MINING_SPEED: `-${percentage.toFixed(1)}% Mining Cooldown`,
    VAULT_EFFICIENCY: `+${percentage.toFixed(1)}% Vault Rewards`,
    PRESTIGE_GAIN: `+${percentage.toFixed(1)}% Prestige Gain`,
    TERRITORY_DEFENSE: `+${percentage.toFixed(1)}% Territory Defense`,
  };

  return effectNames[effectType];
}

/**
 * Calculate effect value for artifact at given level
 * Formula: baseValue + (level - 1) * valuePerLevel
 */
export function calculateArtifactEffectValue(
  baseValue: number,
  valuePerLevel: number,
  level: number
): number {
  return baseValue + (level - 1) * valuePerLevel;
}

/**
 * Apply artifact buffs to a calculation
 * For additive effects (bonuses), multiply result by (1 + buff)
 * For subtractive effects (cooldown reduction), multiply result by (1 - buff)
 */
export function applyArtifactBuff(
  baseValue: number,
  buff: number,
  isSubtractive: boolean = false
): number {
  if (isSubtractive) {
    return baseValue * (1 - Math.abs(buff));
  }
  return baseValue * (1 + buff);
}

/**
 * Get artifact upgrade cost for next level
 */
export function getUpgradeCost({
  nextLevel,
  resonanceCost,
  shardsCost,
}: {
  nextLevel: number;
  shardsCost: number;
  resonanceCost: number;
}): {
  shards: number;
  resonance: number;
} | null {
  if (nextLevel < 2 || nextLevel > 10) {
    return null;
  }

  return {
    resonance: nextLevel * resonanceCost,
    shards: nextLevel * shardsCost,
  };
}
