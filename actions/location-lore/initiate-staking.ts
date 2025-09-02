"use server";

import { Decimal } from "@prisma/client/runtime/library";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { LORE_LEVELS, LoreLevel } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  InitiateLoreStakingParams,
  InitiateLoreStakingResponse,
  InitiateLoreStakingSchema,
} from "@/lib/schema/location-lore";
import { calculateContributionTier } from "@/lib/utils/location-lore";

/**
 * ACTION: Initiate Location Lore Staking (creates payment intent)
 */
export async function initiateLocationLoreStaking(
  params: InitiateLoreStakingParams
): Promise<ApiResponse<InitiateLoreStakingResponse>> {
  try {
    const { success, data } = InitiateLoreStakingSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, targetLevel, nodeId, piAmount } = data;

    // Verify user authentication
    const user = await verifyTokenAndGetUser(accessToken);

    // Validate target level
    const levelConfig = LORE_LEVELS[targetLevel as LoreLevel];

    if (!levelConfig) {
      return {
        success: false,
        error: "Invalid lore level",
      };
    }

    // Validate Pi amount
    if (piAmount < 0.1) {
      return {
        success: false,
        error: "Minimum stake amount is 0.1 Pi",
      };
    }

    if (piAmount > 100) {
      return {
        success: false,
        error: "Maximum stake amount is 100 Pi",
      };
    }

    // Check if node exists
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        locationLore: true,
      },
    });

    if (!node) {
      return {
        success: false,
        error: "Node not found",
      };
    }

    // Check if target level is appropriate
    const currentLevel = node.locationLore?.currentLevel || 0;
    if (targetLevel <= currentLevel) {
      return {
        success: false,
        error: "Target level must be higher than current level",
      };
    }

    if (targetLevel > currentLevel + 1) {
      return {
        success: false,
        error: "Must unlock levels sequentially",
      };
    }

    // Calculate total Pi required for target level
    const currentStaked = node.locationLore?.totalPiStaked || new Decimal(0);
    const requiredTotal = new Decimal(
      levelConfig.totalRequired || levelConfig.piRequired
    );
    const stillNeeded = requiredTotal.minus(currentStaked);

    if (new Decimal(piAmount).gt(stillNeeded)) {
      return {
        success: false,
        error: `Only ${stillNeeded.toString()} Pi needed to reach level ${targetLevel}`,
      };
    }

    // Create stake record (pending payment)
    const stake = await prisma.locationLoreStake.create({
      data: {
        userId: user.piId,
        nodeId,
        piAmount: new Decimal(piAmount),
        targetLevel,
        paymentStatus: "PENDING",
        contributionTier: calculateContributionTier(new Decimal(piAmount)),
      },
    });

    return {
      success: true,
      data: {
        stakeId: stake.id,
        nodeId,
        targetLevel,
        piAmount,
        contributionTier: stake.contributionTier,
        memo: `HarmonicRealm: Level ${targetLevel} Lore for Node ${nodeId.slice(
          0,
          8
        )}...`,
      },
    };
  } catch (error) {
    console.error("Error initiating lore staking:", error);
    return {
      success: false,
      error: "Failed to initiate staking",
    };
  }
}
