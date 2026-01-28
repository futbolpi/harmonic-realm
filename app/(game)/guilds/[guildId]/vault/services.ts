import { endOfWeek, startOfWeek } from "date-fns";

import prisma from "@/lib/prisma";

export const getVaultPageData = async (guildId: string) => {
  const now = new Date();

  // Define the time range (Monday to Sunday)
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  return Promise.all([
    prisma.vaultTransaction.aggregate({
      where: {
        type: { in: ["DEPOSIT", "REWARD"] },
        archivedAt: null,
        createdAt: {
          gte: start,
          lte: end,
        },
        guildMember: { guildId },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.guild.findUnique({
      where: { id: guildId, piTransactionId: { not: null } },
      select: {
        name: true,
        totalContributed: true,
        id: true,
        vaultBalance: true,
        vaultLevel: true,
        piTransactionId: true,
        members: {
          take: 5,
          orderBy: { vaultContribution: "desc" },
          select: { username: true, id: true, vaultContribution: true },
        },
      },
    }),
  ]);
};

export const getVaultClientData = async (vaultLevel: number) => {
  return Promise.all([
    prisma.vaultUpgrade.findUnique({
      where: { level: vaultLevel + 1 },
      select: { resonanceCost: true, description: true, name: true },
    }),
    prisma.vaultUpgrade.findUnique({
      where: { level: vaultLevel },
      select: { maxMembers: true, sharePointsBonus: true },
    }),
  ]);
};

export const getRecentTransactions = async (guildId: string) => {
  return prisma.vaultTransaction.findMany({
    where: { guildMember: { guildId }, archivedAt: null },
    select: {
      id: true,
      balanceAfter: true,
      balanceBefore: true,
      createdAt: true,
      reason: true,
      type: true,
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
};
