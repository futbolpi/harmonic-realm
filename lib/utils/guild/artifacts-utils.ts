import type {
  ArtifactEffectType,
  GuildRole,
  ArtifactRarity,
} from "@/lib/generated/prisma/enums";

/**
 * Permission Checks
 */
export function canResonateShards({
  userGuildId,
  targetGuildId,
  userShards,
  shardsToResonate,
  guildVaultLevel,
  minVaultLevel,
}: {
  userGuildId: string | null;
  targetGuildId: string;
  userShards: number;
  shardsToResonate: number;
  minVaultLevel: number;
  guildVaultLevel: number;
}): { canResonate: boolean; reason?: string } {
  if (!userGuildId) {
    return { canResonate: false, reason: "Not a guild member" };
  }

  if (userGuildId !== targetGuildId) {
    return { canResonate: false, reason: "Not a member of this guild" };
  }

  if (userShards < shardsToResonate) {
    return {
      canResonate: false,
      reason: `Insufficient shards (have ${userShards}, need ${shardsToResonate})`,
    };
  }

  if (guildVaultLevel < minVaultLevel) {
    return {
      canResonate: false,
      reason: `Insufficient vault level (${guildVaultLevel}/${minVaultLevel})`,
    };
  }

  return { canResonate: true };
}

export function canCraftArtifact({
  userRole,
  artifactLevel,
  shardsBurnt,
  requiredShards,
  vaultBalance,
  resonanceCost,
}: {
  userRole: GuildRole | null;
  artifactLevel: number;
  shardsBurnt: number;
  requiredShards: number;
  vaultBalance: number;
  resonanceCost: number;
}): { canCraft: boolean; reason?: string } {
  if (!userRole || (userRole !== "LEADER" && userRole !== "OFFICER")) {
    return { canCraft: false, reason: "Only LEADER/OFFICER can craft" };
  }

  if (artifactLevel > 0) {
    return { canCraft: false, reason: "Artifact already crafted" };
  }

  if (shardsBurnt < requiredShards) {
    return {
      canCraft: false,
      reason: `Insufficient shards resonated (${shardsBurnt}/${requiredShards})`,
    };
  }

  if (vaultBalance < resonanceCost) {
    return {
      canCraft: false,
      reason: `Insufficient vault RESONANCE (need ${resonanceCost}, have ${vaultBalance})`,
    };
  }

  return { canCraft: true };
}

export function canUpgradeArtifact({
  userRole,
  artifactLevel,
  shardsBurnt,
  requiredShards,
  vaultBalance,
  resonanceCost,
}: {
  userRole: GuildRole | null;
  artifactLevel: number;
  shardsBurnt: number;
  requiredShards: number;
  vaultBalance: number;
  resonanceCost: number;
}): { canUpgrade: boolean; reason?: string } {
  if (!userRole || (userRole !== "LEADER" && userRole !== "OFFICER")) {
    return { canUpgrade: false, reason: "Only LEADER/OFFICER can upgrade" };
  }

  if (artifactLevel === 0) {
    return { canUpgrade: false, reason: "Artifact not yet crafted" };
  }

  if (artifactLevel >= 10) {
    return { canUpgrade: false, reason: "Already at max level (10)" };
  }

  if (shardsBurnt < requiredShards) {
    return {
      canUpgrade: false,
      reason: `Insufficient shards resonated (${shardsBurnt}/${requiredShards})`,
    };
  }

  if (vaultBalance < resonanceCost) {
    return {
      canUpgrade: false,
      reason: `Insufficient vault RESONANCE (need ${resonanceCost}, have ${vaultBalance})`,
    };
  }

  return { canUpgrade: true };
}

export function canEquipArtifact({
  userRole,
  artifactLevel,
  currentlyEquipped,
  equippedCount,
  maxSlots,
  isEquipping,
}: {
  userRole: GuildRole | null;
  artifactLevel: number;
  currentlyEquipped: boolean;
  equippedCount: number;
  maxSlots: number;
  isEquipping: boolean;
}): { canEquip: boolean; reason?: string } {
  if (!userRole || (userRole !== "LEADER" && userRole !== "OFFICER")) {
    return { canEquip: false, reason: "Only LEADER/OFFICER can equip" };
  }

  if (artifactLevel === 0) {
    return {
      canEquip: false,
      reason: "Cannot equip uncrafted artifact",
    };
  }

  if (isEquipping && !currentlyEquipped && equippedCount >= maxSlots) {
    return {
      canEquip: false,
      reason: `All artifact slots full (${equippedCount}/${maxSlots})`,
    };
  }

  return { canEquip: true };
}

/**
 * UI Helper Functions
 */
export function getArtifactStatusInfo(
  level: number,
  shardsBurnt: number,
  requiredShards: number,
): {
  status: "uncrafted" | "crafted" | "max_level";
  statusText: string;
  statusColor: string;
  progress: number;
} {
  if (level === 0) {
    const progress = Math.min((shardsBurnt / requiredShards) * 100, 100);
    return {
      status: "uncrafted",
      statusText: "Resonating Shards",
      statusColor: "text-yellow-500",
      progress,
    };
  }

  if (level >= 10) {
    return {
      status: "max_level",
      statusText: "Max Level",
      statusColor: "text-purple-500",
      progress: 100,
    };
  }

  const progress = Math.min((shardsBurnt / requiredShards) * 100, 100);
  return {
    status: "crafted",
    statusText: `Level ${level}`,
    statusColor: "text-primary",
    progress,
  };
}

export function getEffectIcon(effectType: ArtifactEffectType): string {
  const icons: Record<ArtifactEffectType, string> = {
    SHAREPOINT_BONUS: "💎",
    TUNING_QUALITY: "🎯",
    MINING_SPEED: "⚡",
    VAULT_EFFICIENCY: "🏛️",
    PRESTIGE_GAIN: "⭐",
    TERRITORY_DEFENSE: "🛡️",
  };
  return icons[effectType];
}

export function getEffectDescription(effectType: ArtifactEffectType): string {
  const descriptions: Record<ArtifactEffectType, string> = {
    SHAREPOINT_BONUS: "Amplifies share points earned by all guild members",
    TUNING_QUALITY: "Increases chance of perfect tuning sessions",
    MINING_SPEED: "Reduces mining cooldown for all members",
    VAULT_EFFICIENCY: "Increases vault rewards distribution",
    PRESTIGE_GAIN: "Amplifies prestige gained from all sources",
    TERRITORY_DEFENSE: "Strengthens defense in territorial wars",
  };
  return descriptions[effectType];
}

export function getRarityColor(rarity: ArtifactRarity): string {
  const colors: Record<ArtifactRarity, string> = {
    COMMON: "text-gray-400 border-gray-400/30",
    RARE: "text-blue-400 border-blue-400/30",
    EPIC: "text-purple-400 border-purple-400/30",
    LEGENDARY: "text-orange-400 border-orange-400/30",
  };
  return colors[rarity] || colors.COMMON;
}

export function formatContributors(
  contributors: Record<string, number>,
): { username: string; amount: number }[] {
  return Object.entries(contributors)
    .map(([username, amount]) => ({ username, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}
