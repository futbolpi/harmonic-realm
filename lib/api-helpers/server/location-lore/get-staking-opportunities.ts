import { Decimal } from "@prisma/client/runtime/library";

import { LORE_LEVELS, LoreLevel } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { StakingOpportunity } from "@/lib/schema/location-lore";
import { calculateDistance } from "@/lib/utils";
import { estimateCompletionTime } from "@/lib/utils/location-lore";

/**
 * ACTION: Get Available Staking Opportunities
 */
export async function getStakingOpportunities(
  limit: number = 20,
  userLatitude?: number,
  userLongitude?: number
): Promise<ApiResponse<StakingOpportunity[]>> {
  try {
    // Base query for nodes with incomplete lore
    const whereClause = {
      OR: [
        { locationLore: null }, // No lore at all
        {
          locationLore: {
            currentLevel: {
              lt: 5, // Less than max level
            },
          },
        },
      ],
    };

    // Get nodes with potential for lore staking
    const nodes = await prisma.node.findMany({
      where: whereClause,
      include: {
        locationLore: {
          include: {
            stakes: {
              where: { paymentStatus: "COMPLETED" },
            },
          },
        },
        type: { select: { name: true, rarity: true } },
      },
      take: limit * 2, // Get more for filtering
    });

    // Process and filter opportunities
    const opportunities = nodes
      .map((node) => {
        const currentLevel = node.locationLore?.currentLevel || 0;
        const nextLevel = Math.min(currentLevel + 1, 5) as LoreLevel;
        const nextLevelConfig = LORE_LEVELS[nextLevel];

        if (!nextLevelConfig) return null;

        const currentStaked =
          node.locationLore?.totalPiStaked || new Decimal(0);
        const requiredTotal = new Decimal(
          nextLevelConfig.totalRequired || nextLevelConfig.piRequired
        );
        const stillNeeded = requiredTotal.minus(currentStaked);

        if (stillNeeded.lte(0)) return null; // Already funded

        // Calculate distance if user location provided
        let distance = null;
        if (userLatitude && userLongitude) {
          const lat1 = userLatitude;
          const lon1 = userLongitude;
          const lat2 = node.latitude;
          const lon2 = node.longitude;

          distance = calculateDistance(lat1, lon1, lat2, lon2);
        }

        return {
          nodeId: node.id,
          coordinates: {
            latitude: node.latitude,
            longitude: node.longitude,
          },
          nodeType: node.type.name,
          rarity: node.type.rarity,
          currentLevel,
          nextLevel: {
            level: nextLevel,
            piRequired: stillNeeded.toNumber(),
            description: nextLevelConfig.description,
            name: nextLevelConfig.name,
          },
          totalStaked: currentStaked.toNumber(),
          estimatedCompletionTime: estimateCompletionTime(
            stillNeeded.toNumber()
          ),
          distance,
        };
      })
      .filter((opp) => opp !== null)
      .sort((a, b) => {
        // Sort by distance if available, otherwise by Pi required
        if (a?.distance && b?.distance) {
          return a.distance - b.distance;
        }

        return a.nextLevel.piRequired - b.nextLevel.piRequired;
      })
      .slice(0, limit);

    return {
      success: true,
      data: opportunities,
    };
  } catch (error) {
    console.error("Error fetching staking opportunities:", error);
    return {
      success: false,
      error: "Failed to fetch staking opportunities",
    };
  }
}
