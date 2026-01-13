import prisma from "@/lib/prisma";

/**
 * Fetch territory with all related data for detail page
 */
export async function getTerritoryDetail(hexId: string) {
  const territory = await prisma.territory.findUnique({
    where: { hexId },
    include: {
      guild: {
        select: {
          id: true,
          name: true,
          tag: true,
          emblem: true,
          vaultBalance: true,
          members: {
            where: { isActive: true },
            select: { username: true, role: true },
            take: 5,
          },
        },
      },
      activeChallenge: {
        include: {
          attacker: {
            select: { id: true, name: true, tag: true, emblem: true },
          },
          defender: {
            select: { id: true, name: true, tag: true, emblem: true },
          },
          contributions: {
            select: {
              username: true,
              sharePoints: true,
              tuneCount: true,
            },
            orderBy: { sharePoints: "desc" },
            take: 20,
          },
        },
      },
      nodes: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          type: { select: { name: true, rarity: true } },
        },
        take: 50,
      },
      challengeHistory: {
        select: {
          id: true,
          createdAt: true,
          endsAt: true,
          resolved: true,
          winnerId: true,
          defenderId: true,
          defender: { select: { name: true, tag: true } },
          attacker: { select: { name: true, tag: true } },
          defenderScore: true,
          attackerScore: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return territory;
}

export type TerritoryDetail = NonNullable<
  Awaited<ReturnType<typeof getTerritoryDetail>>
>;

export async function getTerritoryDetailMeta(hexId: string) {
  return prisma.territory.findUnique({
    where: { hexId },
    select: {
      trafficScore: true,
      guild: { select: { name: true } },
      _count: { select: { nodes: true } },
    },
  });
}
