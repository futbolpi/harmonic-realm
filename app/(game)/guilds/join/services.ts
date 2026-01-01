import prisma from "@/lib/prisma";

export const getGuildJoinData = async (guildId: string) => {
  return prisma.guild.findUnique({
    where: { id: guildId, piTransactionId: { not: null } },
    select: {
      name: true,
      id: true,
      maxMembers: true,
      minRF: true,
      requireApproval: true,
      _count: { select: { members: true } },
    },
  });
};
