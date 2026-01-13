import prisma from "@/lib/prisma";

export const getGuildDetailsData = async (guildId: string) => {
  return prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      emblem: true,
      name: true,
      tag: true,
      vaultLevel: true,
      maxMembers: true,
      vaultBalance: true,
      totalSharePoints: true,
      leaderUsername: true,
      piTransactionId: true,
      _count: {
        select: { members: { where: { isActive: true } }, territories: true },
      },
      members: {
        select: { username: true, weeklySharePoints: true },
        orderBy: { weeklySharePoints: "desc" },
        take: 3,
        where: { isActive: true },
      },
    },
  });
};
