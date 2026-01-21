import prisma from "@/lib/prisma";
import {
  AwardPrestigeInput,
  getPointsForNextLevel,
  getPrestigeLevelFromPoints,
  getPrestigeProgressPercentage,
  getPrestigeTier,
  getTierRewards,
} from "@/lib/utils/prestige";

/**
 * ACTION: Award prestige points to a guild
 * Handles level ups and multiplier updates
 *
 * Called from:
 * - Challenge completions
 * - Territory victories
 * - Member milestones
 * - Vault upgrades
 * - Weekly activity bonuses
 */
export async function awardPrestige(params: AwardPrestigeInput) {
  const { amount, guildId, metadata, source } = params;
  try {
    // Award prestige points in transaction
    const result = await prisma.$transaction(async (tx) => {
      const guild = await tx.guild.findUnique({
        where: { id: guildId },
        select: { prestigePoints: true, prestigeLevel: true },
      });

      if (!guild) {
        throw new Error("Guild not found");
      }

      const oldPoints = guild.prestigePoints;
      const newPoints = oldPoints + amount;
      const oldLevel = guild.prestigeLevel;
      const newLevel = getPrestigeLevelFromPoints(newPoints);

      // Update guild prestige
      const updated = await tx.guild.update({
        where: { id: guildId },
        data: {
          prestigePoints: newPoints,
          prestigeLevel: Math.min(newLevel, 100), // Cap at 100
          prestigeMultiplier: 1 + Math.min(newLevel, 100) * 0.005,
        },
        select: {
          id: true,
          prestigePoints: true,
          prestigeLevel: true,
          prestigeMultiplier: true,
        },
      });

      // Log prestige award
      await tx.prestigeLog.create({
        data: {
          guildId,
          amount,
          source,
          metadata,
        },
      });

      return {
        guild: updated,
        leveledUp: newLevel > oldLevel,
        oldLevel,
        newLevel: Math.min(newLevel, 100),
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error awarding prestige:", error);
    return {
      success: false,
      error: "Failed to award prestige",
    };
  }
}

/**
 * Get guild prestige stats
 */
export async function getGuildPrestigeStats(guildId: string) {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      prestigePoints: true,
      prestigeLevel: true,
      prestigeMultiplier: true,
    },
  });

  if (!guild) {
    return null;
  }

  const tier = getPrestigeTier(guild.prestigeLevel);
  const progressPercent = getPrestigeProgressPercentage(
    guild.prestigePoints,
    guild.prestigeLevel
  );
  const nextLevelPoints = getPointsForNextLevel(guild.prestigeLevel);
  const pointsToNextLevel = nextLevelPoints - guild.prestigePoints;
  const tierRewards = getTierRewards(tier);

  return {
    prestigePoints: guild.prestigePoints,
    prestigeLevel: guild.prestigeLevel,
    prestigeMultiplier: guild.prestigeMultiplier,
    tier,
    progressPercent,
    nextLevelPoints,
    pointsToNextLevel,
    tierRewards,
  };
}

/**
 * Get prestige leaderboard
 */
export async function getPrestigeLeaderboard(limit: number = 10) {
  const leaderboard = await prisma.guild.findMany({
    select: {
      id: true,
      name: true,
      emblem: true,
      prestigeLevel: true,
      prestigePoints: true,
      _count: { select: { members: { where: { isActive: true } } } },
    },
    orderBy: [{ prestigeLevel: "desc" }, { prestigePoints: "desc" }],
    take: limit,
  });

  return leaderboard.map((guild, index) => ({
    rank: index + 1,
    ...guild,
    tier: getPrestigeTier(guild.prestigeLevel),
  }));
}

/**
 * Get prestige history for a guild
 */
export async function getPrestigeHistory(guildId: string, limit: number = 50) {
  const history = await prisma.prestigeLog.findMany({
    where: { guildId },
    select: {
      id: true,
      amount: true,
      source: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return history;
}
