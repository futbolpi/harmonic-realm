import prisma from "@/lib/prisma";

export const getGuildsPageData = async () => {
  return prisma.guild.findMany({
    where: { isPublic: true, piTransactionId: { not: null } },
    select: {
      id: true,
      emblem: true,
      name: true,
      leaderUsername: true,
      tag: true,
      maxMembers: true,
      vaultBalance: true,
      _count: { select: { members: true } },
    },
    orderBy: { totalSharePoints: "desc" },
  });
};
