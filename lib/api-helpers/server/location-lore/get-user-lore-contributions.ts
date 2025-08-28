import { Decimal } from "@prisma/client/runtime/library";

import { ContributionTier, NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { CONTRIBUTION_TIERS } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";

type GroupedContribution = {
  nodeId: string;
  node: {
    id: string;
    latitude: number;
    longitude: number;
    type: {
      name: string;
      rarity: NodeTypeRarity;
    };
  };
  totalContributed: Decimal;
  contributions: {
    amount: number;
    targetLevel: number;
    contributionTier: ContributionTier | null;
    createdAt: Date;
    txid: string | null;
  }[];
  currentLevel: number;
};

/**
 * ACTION: Get User's Lore Contributions
 */
export async function getUserLoreContributions(userId: string) {
  try {
    const contributions = await prisma.locationLoreStake.findMany({
      where: {
        userId,
        paymentStatus: "COMPLETED",
      },
      include: {
        locationLore: {
          include: {
            node: {
              select: {
                id: true,
                latitude: true,
                longitude: true,
                type: { select: { rarity: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by node and calculate totals
    const groupedContributions = contributions.reduce((acc, stake) => {
      if (!acc[stake.nodeId]) {
        acc[stake.nodeId] = {
          nodeId: stake.nodeId,
          node: stake.locationLore.node,
          totalContributed: new Decimal(0),
          contributions: [],
          currentLevel: stake.locationLore?.currentLevel || 0,
        };
      }

      acc[stake.nodeId].totalContributed = acc[
        stake.nodeId
      ].totalContributed.plus(stake.piAmount);
      acc[stake.nodeId].contributions.push({
        amount: stake.piAmount.toNumber(),
        targetLevel: stake.targetLevel,
        contributionTier: stake.contributionTier,
        createdAt: stake.createdAt,
        txid: stake.piTransactionId,
      });

      return acc;
    }, {} as Record<string, GroupedContribution>);

    const result = Object.values(groupedContributions).map((group) => ({
      ...group,
      totalContributed: group.totalContributed.toNumber(),
    }));

    // Calculate user's overall statistics
    const totalContributed = contributions.reduce(
      (sum, stake) => sum.plus(stake.piAmount),
      new Decimal(0)
    );

    const highestTier = contributions.reduce((highest, stake) => {
      const tiers = Object.keys(CONTRIBUTION_TIERS);
      const currentIndex = tiers.indexOf(
        stake.contributionTier || "ECHO_SUPPORTER"
      );
      const highestIndex = tiers.indexOf(highest);
      return currentIndex > highestIndex
        ? stake.contributionTier || "ECHO_SUPPORTER"
        : highest;
    }, "ECHO_SUPPORTER" as ContributionTier);

    return {
      success: true,
      data: {
        contributions: result,
        stats: {
          totalContributed: totalContributed.toNumber(),
          nodeCount: Object.keys(groupedContributions).length,
          highestTier,
          totalTransactions: contributions.length,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    return {
      success: false,
      error: "Failed to fetch contributions",
    };
  }
}
