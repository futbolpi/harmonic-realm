import prisma from "@/lib/prisma";

export type LeaderboardType = "prestige" | "activity" | "vault" | "territories";
export type TimeRange = "week" | "month" | "all_time";

/**
 * Fetch all public guilds with complete data for client-side filtering/sorting
 */
export async function getAllPublicGuilds() {
  return prisma.guild.findMany({
    where: {
      piTransactionId: { not: null },
      isPublic: true,
    },
    select: {
      id: true,
      name: true,
      emblem: true,
      tag: true,
      prestigePoints: true,
      prestigeLevel: true,
      weeklyActivity: true,
      totalSharePoints: true,
      totalContributed: true,
      vaultBalance: true,
      vaultLevel: true,
      leaderUsername: true,
      createdAt: true,
      _count: {
        select: {
          members: { where: { isActive: true } },
          territories: true,
        },
      },
    },
    orderBy: { prestigePoints: "desc" },
  });
}

export type LeaderboardGuild = Awaited<
  ReturnType<typeof getAllPublicGuilds>
>[number];
