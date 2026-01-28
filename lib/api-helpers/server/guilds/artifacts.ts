import prisma from "@/lib/prisma";
import { calculateArtifactEffectValue } from "@/lib/utils/guild/artifact";
import type {
  ArtifactEffectType,
  NodeTypeRarity,
} from "@/lib/generated/prisma/enums";

/**
 * CORE LOGIC: Resonate shards toward artifact crafting
 * Any guild member can call this to contribute shards
 * Shards are deducted from member, accumulated in artifact's shardsBurnt
 * only callable if guild vault level >= template minVaultLevel
 *
 * Effects:
 * - Deduct shards from GuildMember
 * - Increment GuildArtifact.shardsBurnt
 * - Track contributor in contributors JSON
 * - Returns crafting progress (shardsBurnt/required)
 */
export async function resonateShardsForArtifact({
  guildId,
  shardsToResonate,
  templateId,
  username,
}: {
  guildId: string;
  username: string;
  templateId: string;
  shardsToResonate: number;
}): Promise<{
  success: boolean;
  error?: string;
  progress?: {
    shardsBurnt: number;
    required: number;
    percentage: number;
    isCrafted: boolean;
  };
}> {
  try {
    // Verify member exists and has shards
    const member = await prisma.guildMember.findUnique({
      where: { guildId_username: { guildId, username } },
      select: { echoShards: true, guild: { select: { vaultLevel: true } } },
    });

    if (!member) {
      return { success: false, error: "Guild member not found" };
    }

    if (member.echoShards < shardsToResonate) {
      return {
        success: false,
        error: `Insufficient shards (have ${member.echoShards}, need ${shardsToResonate})`,
      };
    }

    // Get template
    const template = await prisma.artifactTemplate.findUnique({
      where: { id: templateId },
      select: { minVaultLevel: true },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    if (member.guild.vaultLevel < template.minVaultLevel) {
      return {
        success: false,
        error: `Insufficient guild level (${member.guild.vaultLevel}/${template.minVaultLevel})`,
      };
    }

    // Resonate in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct shards from member
      await tx.guildMember.update({
        where: { guildId_username: { guildId, username } },
        data: { echoShards: { decrement: shardsToResonate } },
        select: { username: true },
      });

      // Get or create artifact (level 0 until crafting threshold met)
      let artifact = await tx.guildArtifact.findUnique({
        where: { guildId_templateId: { guildId, templateId } },
        select: { contributors: true, id: true },
      });

      if (!artifact) {
        artifact = await tx.guildArtifact.create({
          data: {
            guildId,
            templateId,
            level: 0, // Not yet crafted
            shardsBurnt: 0,
            contributors: {},
          },
          select: { contributors: true, id: true },
        });
      }

      // Update shardsBurnt and contributors
      const currentContributors =
        (artifact.contributors as Record<string, number>) || {};
      const updated = await tx.guildArtifact.update({
        where: { id: artifact.id },
        data: {
          shardsBurnt: { increment: shardsToResonate },
          contributors: {
            ...currentContributors,
            [username]: (currentContributors[username] || 0) + shardsToResonate,
          },
        },
        select: {
          shardsBurnt: true,
          level: true,
          template: { select: { echoShardsCost: true } },
        },
      });

      return updated;
    });

    // Calculate progress
    const progress = {
      shardsBurnt: result.shardsBurnt,
      required: result.template.echoShardsCost,
      percentage: Math.min(
        100,
        (result.shardsBurnt / result.template.echoShardsCost) * 100,
      ),
      isCrafted: result.level > 0,
    };

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("Error resonating shards:", error);
    return { success: false, error: "Failed to resonate shards" };
  }
}

/**
 * CRAFTING COMPLETION: Officer finalizes artifact crafting
 * Only callable if shardsBurnt >= template cost
 * Sets level from 0 → 1, resets shardsBurnt for upgrade phase
 *
 * Effects:
 * - Set GuildArtifact.level to 1
 * - Reset GuildArtifact.shardsBurnt to 0 (for upgrade phase)
 * - Burn RESONANCE from vault
 */
export async function completeCraftArtifact(
  guildId: string,
  templateId: string,
): Promise<{
  success: boolean;
  error?: string;
  artifact?: {
    level: number;
    id: string;
    shardsBurnt: number;
  };
}> {
  try {
    // Get artifact and template
    const artifact = await prisma.guildArtifact.findUnique({
      where: { guildId_templateId: { guildId, templateId } },
      select: {
        id: true,
        level: true,
        shardsBurnt: true,
        template: { select: { echoShardsCost: true, resonanceCost: true } },
        guild: { select: { vaultBalance: true } },
      },
    });

    if (!artifact) {
      return { success: false, error: "Artifact not found" };
    }

    if (artifact.level > 0) {
      return { success: false, error: "Artifact already crafted" };
    }

    if (artifact.shardsBurnt < artifact.template.echoShardsCost) {
      return {
        success: false,
        error: `Insufficient shards resonated (${artifact.shardsBurnt}/${artifact.template.echoShardsCost})`,
      };
    }

    if (artifact.guild.vaultBalance < artifact.template.resonanceCost) {
      return {
        success: false,
        error: `Insufficient vault RESONANCE`,
      };
    }

    // Complete crafting in transaction
    const completed = await prisma.$transaction(async (tx) => {
      // Burn resonance
      const updatedGuild = await tx.guild.update({
        where: { id: guildId },
        data: { vaultBalance: { decrement: artifact.template.resonanceCost } },
        select: { vaultBalance: true, leaderUsername: true },
      });

      // create vault tx
      await tx.vaultTransaction.create({
        data: {
          amount: artifact.template.resonanceCost,
          balanceAfter: updatedGuild.vaultBalance,
          balanceBefore:
            updatedGuild.vaultBalance + artifact.template.resonanceCost,
          type: "WITHDRAWAL",
          memberUsername: updatedGuild.leaderUsername,
          reason: "Artifact craft payment",
          metadata: { artifactId: artifact.id },
        },
        select: { id: true },
      });

      // Set level to 1 (crafted), reset shardsBurnt for upgrade phase
      return await tx.guildArtifact.update({
        where: { id: artifact.id },
        data: {
          level: 1, // Now crafted
          shardsBurnt: { decrement: artifact.template.echoShardsCost }, // Decrease shard cost
        },
        select: { id: true, level: true, shardsBurnt: true },
      });
    });

    return { success: true, artifact: completed };
  } catch (error) {
    console.error("Error completing craft:", error);
    return { success: false, error: "Failed to complete crafting" };
  }
}

/**
 * Get all active artifact effects for a guild (only crafted, equipped artifacts)
 * Returns map of effect type -> combined bonus value
 */
export async function getGuildArtifactBuffs(
  guildId: string,
): Promise<Record<ArtifactEffectType, number>> {
  const artifacts = await prisma.guildArtifact.findMany({
    where: {
      guildId,
      isEquipped: true,
      level: { gt: 0 }, // Only crafted artifacts
    },
    include: { template: true },
  });

  const buffs: Record<ArtifactEffectType, number> = {
    SHAREPOINT_BONUS: 0,
    TUNING_QUALITY: 0,
    MINING_SPEED: 0,
    VAULT_EFFICIENCY: 0,
    PRESTIGE_GAIN: 0,
    TERRITORY_DEFENSE: 0,
  };

  for (const artifact of artifacts) {
    const effectValue = calculateArtifactEffectValue(
      artifact.template.baseValue,
      artifact.template.valuePerLevel,
      artifact.level,
    );

    buffs[artifact.template.effectType as ArtifactEffectType] += effectValue;
  }

  return buffs;
}

/**
 * ECHO SHARDS LORE INTEGRATION
 *
 * Echo Shards represent a member's attunement to the Harmonic Realm through resonance.
 * Each activity type generates shards differently:
 *
 * MINING: Geological resonance from node exploitation
 *   - Earning: Base calculation from shares earned + rarity multiplier
 *   - Formula: floor(sharesEarned * rarity_bonus * 0.1) min 1 shard
 *   - Lore: "The echoes within the earth respond to your presence"
 *   - Scales: Higher rarity nodes = more resonance captured
 *
 * TUNING: Harmonic calibration through rhythmic precision
 *   - Earning: Accuracy-weighted with streak bonuses
 *   - Formula: floor(accuracy * 0.5 + (streak_bonus * 0.1))
 *   - Lore: "Your timing aligns with the cosmic frequency"
 *   - Scales: Perfect accuracy (100) = 50 shards baseline
 *
 * DRIFTING: Dimensional displacement causing harmonic disruption
 *   - Earning: Rare trigger chance (20%) with escalating distance bonus
 *   - Formula: Random 15-35 shards if triggered, + distance_km * 2
 *   - Lore: "Rifts in space resonate with untapped potential"
 *   - Scales: Rarer action, higher risk/reward
 *
 * ANCHORING: Permanent resonant infrastructure creation
 *   - Earning: Guaranteed, scaled by phase and prestige burn
 *   - Formula: floor(10 + (referralPoints * 0.2) + node_rarity_bonus)
 *   - Lore: "The anchor radiates cascading harmonic frequencies"
 *   - Scales: Community contribution (referral points) increases yield
 *
 * CALIBRATION: Lattice calibration (team milestone event)
 *   - Earning: Milestone-based, splits among contributors
 *   - Formula: floor(pi_staked / total_pi_staked * phase_total_shards)
 *   - Lore: "Collective resonance awakens the lattice"
 *   - Scales: Fair share based on individual contribution
 *
 * LORE STAKING: Narrative resonance (community storytelling)
 *   - Earning: Stake-weighted, rarity-enhanced
 *   - Formula: floor(pi_staked * (base_level_multiplier) + lore_rarity_bonus)
 *   - Lore: "The story deepens the realm's resonance"
 *   - Scales: Investing in lore generates harmonic energy
 */
export async function addEchoShards(
  guildId: string,
  username: string,
  actionType:
    | "MINING"
    | "TUNING"
    | "DRIFTING"
    | "ANCHORING"
    | "CALIBRATION"
    | "LORE_STAKING",
  metrics: {
    // MINING
    sharesEarned?: number;
    nodeRarity?: NodeTypeRarity;
    // TUNING
    accuracyScore?: number;
    dailyStreak?: number;
    competitiveBonus?: boolean;
    // DRIFTING
    driftDistance?: number;
    driftCount?: number;
    // ANCHORING
    referralPointsBurned?: number;
    nodeRarity_anchor?: NodeTypeRarity;
    // CALIBRATION
    piStaked?: number;
    totalContributionPi?: number;
    calPhaseNumber?: number;
    // LORE STAKING
    piLoreStaked?: number;
    loreLevel?: number;
    nodeRarity_lore?: NodeTypeRarity;
  } = {},
): Promise<{
  success: boolean;
  total: number;
  earned: number;
  actionType: string;
}> {
  try {
    let shardsToEarn = 0;

    // Rarity multipliers for consistent lore alignment
    const rarityMultipliers: Record<NodeTypeRarity, number> = {
      Common: 1,
      Uncommon: 1.2,
      Rare: 1.5,
      Epic: 2,
      Legendary: 3,
    };

    // Calculate earned shards based on action type
    switch (actionType) {
      case "MINING": {
        // Geological resonance: shares + rarity bonus
        // Example: 50 shares from Legendary node = 50 * 3 * 0.1 = 15 shards
        const baseShares = metrics.sharesEarned || 0;
        const rarityMult =
          rarityMultipliers[metrics.nodeRarity || "Common"] || 1;
        shardsToEarn = Math.max(1, Math.floor(baseShares * rarityMult * 0.1));
        break;
      }

      case "TUNING": {
        // Harmonic calibration: accuracy-weighted + streak bonus
        // Example: 95% accuracy with 5-day streak = 9.5 + 0.5 = 10 shards
        const accuracy = metrics.accuracyScore || 0;
        const streak = metrics.dailyStreak || 0;
        const streakBonus = Math.min(streak, 20) * 0.05; // Max 20 days streak = +1.0
        const competitiveMult = metrics.competitiveBonus ? 1.2 : 1; // 1.5x multiplier = +20% shards
        shardsToEarn = Math.max(
          1,
          Math.floor((accuracy * 0.1 + streakBonus) * competitiveMult),
        );
        break;
      }

      case "DRIFTING": {
        // Dimensional displacement: 20% trigger chance + distance scaling
        // High-risk/reward: Avg 25 shards + 2/km bonus
        // Example: Successful drift 50km away = 25 + (50 * 2) = 125 shards
        const triggerChance = Math.random();
        if (triggerChance < 0.2) {
          // 20% chance to earn shards (rare event)
          const baseReward = Math.floor(Math.random() * 20 + 15); // 15-35 shards
          const distanceBonus = (metrics.driftDistance || 0) * 2;
          shardsToEarn = baseReward + Math.floor(distanceBonus);
        }
        // Otherwise 0 shards (no resonance captured)
        break;
      }

      case "ANCHORING": {
        // Permanent infrastructure: guaranteed + prestige scaling
        // Example: 100 referral points burned + Epic node = 10 + (100*0.2) + (2*bonus) = 32 shards
        const refPoints = metrics.referralPointsBurned || 0;
        const rarityMult =
          rarityMultipliers[metrics.nodeRarity_anchor || "Common"] || 1;
        const rarityBonus = Math.floor((rarityMult - 1) * 5); // Common=0, Uncommon=1, Rare=2.5→2, Epic=5, Legendary=10
        shardsToEarn = Math.max(
          5,
          10 + Math.floor(refPoints * 0.2) + rarityBonus,
        );
        break;
      }

      case "CALIBRATION": {
        // Team milestone: fair share distribution
        // Example: Staked 50π of 500π total = 50/500 * 100 base shards = 10 shards
        const pi = metrics.piStaked || 0;
        const totalPi = metrics.totalContributionPi || pi || 1; // Fallback to avoid division by zero
        const phaseShards = 100 + (metrics.calPhaseNumber || 1) * 10; // Scale with phase number
        shardsToEarn = Math.max(1, Math.floor((pi / totalPi) * phaseShards));
        break;
      }

      case "LORE_STAKING": {
        // Narrative resonance: stake-weighted + level enhancement
        // Example: 50π at Level 2 Legendary = (50 * 1.5) + (3*2*5) = 105 shards
        const pi = metrics.piLoreStaked || 0;
        const level = metrics.loreLevel || 0;
        const rarityMult =
          rarityMultipliers[metrics.nodeRarity_lore || "Common"] || 1;
        const levelBonus = Math.floor(level * 2.5); // Each level adds value
        shardsToEarn = Math.max(
          2,
          Math.floor(pi * rarityMult + rarityMult * levelBonus),
        );
        break;
      }

      default:
        return { success: false, total: 0, earned: 0, actionType };
    }

    // Update member's echo shards atomically
    const updated = await prisma.guildMember.update({
      where: { guildId_username: { guildId, username } },
      data: { echoShards: { increment: shardsToEarn } },
      select: { echoShards: true },
    });

    return {
      success: true,
      total: updated.echoShards,
      earned: shardsToEarn,
      actionType,
    };
  } catch (error) {
    console.error(`Error adding echo shards (${actionType}):`, error);
    return { success: false, total: 0, earned: 0, actionType };
  }
}
