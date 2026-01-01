import prisma from "@/lib/prisma";

export type Guild = {
  id: string;
  emblem: string;
  name: string;
  description: string | null;
  minRF: number;
  maxMembers: number;
  vaultLevel: number;
  totalSharePoints: number;
  requireApproval: boolean;
  _count: { members: number };
  createdAt: Date;
};

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
      _count: { select: { members: true } },
    },
  });
};
