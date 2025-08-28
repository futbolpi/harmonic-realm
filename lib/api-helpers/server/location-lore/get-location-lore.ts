import { Decimal } from "@prisma/client/runtime/library";

import { ContributionTier } from "@/lib/generated/prisma/enums";
import { LORE_LEVELS, LoreLevel } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";
import { calculateContributionTier } from "@/lib/utils/location-lore";

/**
 * QUERY: Get Location Lore for a specific node
 */
export async function getLocationLore(nodeId: string) {
  try {
    const locationLore = await prisma.locationLore.findUnique({
      where: { nodeId },
      include: {
        stakes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        node: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            type: true,
          },
        },
      },
    });

    if (!locationLore) {
      return null;
    }

    // Calculate contributor statistics
    const contributors = locationLore.stakes
      .filter((stake) => stake.paymentStatus === "COMPLETED")
      .reduce(
        (acc, stake) => {
          const existing = acc.find((c) => c.userId === stake.userId);
          if (existing) {
            existing.piContributed = existing.piContributed.plus(
              stake.piAmount
            );
            existing.tier = calculateContributionTier(existing.piContributed);
          } else {
            acc.push({
              userId: stake.userId,
              username: stake.user.username,
              piContributed: stake.piAmount,
              tier: calculateContributionTier(stake.piAmount),
            });
          }
          return acc;
        },
        [] as Array<{
          userId: string;
          username: string;
          piContributed: Decimal;
          tier: ContributionTier;
        }>
      );

    // Calculate next level requirements
    const nextLevel = locationLore.currentLevel + 1;
    const nextLevelConfig = LORE_LEVELS[nextLevel as LoreLevel];

    const nextLevelRequirement = nextLevelConfig
      ? {
          level: nextLevel,
          piRequired: nextLevelConfig.piRequired,
          currentProgress: locationLore.totalPiStaked.toNumber(),
          totalRequired:
            nextLevelConfig.totalRequired || nextLevelConfig.piRequired,
        }
      : null;

    const response = {
      nodeId: locationLore.nodeId,
      coordinates: {
        latitude: locationLore.node.latitude,
        longitude: locationLore.node.longitude,
      },
      currentLevel: locationLore.currentLevel,
      totalPiStaked: locationLore.totalPiStaked.toNumber(),
      generationStatus: locationLore.generationStatus,
      loreContent: {
        basicHistory: locationLore.basicHistory,
        culturalSignificance: locationLore.culturalSignificance,
        mysticInterpretation: locationLore.mysticInterpretation,
        epicNarrative: locationLore.epicNarrative,
        legendaryTale: locationLore.legendaryTale,
      },
      cosmeticThemes: locationLore.cosmeticThemes,
      audioThemes: locationLore.audioThemes,
      address: {
        displayName: locationLore.address,
        country: locationLore.country,
        state: locationLore.state,
        city: locationLore.city,
        district: locationLore.district,
      },
      contributors: contributors.map((c) => ({
        ...c,
        piContributed: c.piContributed.toNumber(),
      })),
      nextLevelRequirement,
      lastGeneratedAt: locationLore.lastGeneratedAt,
    };

    return response;
  } catch (error) {
    console.error("Error fetching location lore:", error);
    return null;
  }
}
