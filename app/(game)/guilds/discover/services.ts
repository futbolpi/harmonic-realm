import prisma from "@/lib/prisma";

export const getGuilds = async () => {
  return prisma.guild.findMany({
    where: { piTransactionId: { not: null }, isPublic: true },
    select: {
      id: true,
      emblem: true,
      name: true,
      description: true,
      minRF: true,
      maxMembers: true,
      vaultLevel: true,
      totalSharePoints: true,
      createdAt: true,
      requireApproval: true,
      prestigeLevel: true,
      _count: {
        select: { members: true, territories: true, challengesActive: true },
      },
    },
  });
};

export type Guild = Awaited<ReturnType<typeof getGuilds>>[number];
