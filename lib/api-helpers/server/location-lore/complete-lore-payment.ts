import { Decimal } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { LORE_LEVELS, LoreLevel } from "@/lib/node-lore/location-lore";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { addEchoShards } from "../guilds/artifacts";

type Params = {
  paymentId: string;
  txid: string;
  stakeId: string;
  amount: number;
};

/**
 * ACTION: Complete Pi Payment and Trigger Lore Generation
 */
export async function completeLocationLorePayment({
  paymentId,
  stakeId,
  txid,
  amount,
}: Params): Promise<ApiResponse<undefined>> {
  try {
    // Find the stake record
    const stake = await prisma.locationLoreStake.findFirst({
      where: {
        id: stakeId,
        paymentId,
        paymentStatus: "PROCESSING",
        piAmount: { lte: amount },
      },
      select: {
        nodeId: true,
        piAmount: true,
        targetLevel: true,
        user: {
          select: {
            guildMembership: {
              select: { guildId: true, username: true },
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!stake) {
      return {
        success: false,
        error: "Processing stake not found",
      };
    }

    // Complete the payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update stake record
      await tx.locationLoreStake.update({
        where: { id: stakeId },
        data: {
          piTransactionId: txid,
          paymentStatus: "COMPLETED",
        },
      });

      // Update or create location lore record
      const updatedLore = await tx.locationLore.upsert({
        where: { nodeId: stake.nodeId },
        create: {
          nodeId: stake.nodeId,
          currentLevel: 0, // Will be updated after generation
          totalPiStaked: stake.piAmount,
          generationStatus: "PENDING",
        },
        update: {
          totalPiStaked: {
            increment: stake.piAmount,
          },
        },
        select: { totalPiStaked: true },
      });

      // Check if we have enough Pi for the target level
      const levelConfig = LORE_LEVELS[stake.targetLevel as LoreLevel];
      const requiredTotal = new Decimal(
        levelConfig.totalRequired || levelConfig.piRequired,
      );

      if (updatedLore.totalPiStaked.gte(requiredTotal)) {
        // Create lore generation job
        const job = await tx.loreGenerationJob.create({
          data: {
            nodeId: stake.nodeId,
            targetLevel: stake.targetLevel,
            status: "PENDING",
          },
        });

        return { shouldGenerate: true, jobId: job.id };
      }

      return { shouldGenerate: false, jobId: null };
    });

    // Trigger lore generation if threshold reached
    if (result.shouldGenerate && result.jobId) {
      await InngestEventDispatcher.startLoreGeneration(
        stake.nodeId,
        stake.targetLevel as LoreLevel,
        result.jobId,
      );
    }

    // Award echo shards for lore staking (narrative resonance)
    // Only if staker is in a guild

    const guildMembership = stake.user.guildMembership;

    if (guildMembership) {
      // Fetch node rarity for context
      const node = await prisma.node.findUnique({
        where: { id: stake.nodeId },
        select: { type: { select: { rarity: true } } },
      });

      await addEchoShards(
        guildMembership.guildId,
        guildMembership.username,
        "LORE_STAKING",
        {
          piLoreStaked: stake.piAmount.toNumber(),
          loreLevel: stake.targetLevel,
          nodeRarity_lore: node?.type?.rarity,
        },
      );
    }

    // Revalidate relevant paths
    revalidatePath("/nodes/[id]", "page");
    revalidatePath("/nodes/[id]/lore", "page");
    revalidatePath(`/lore-stakes/${stakeId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error completing lore payment:", error);
    return {
      success: false,
      error: "Failed to complete payment",
    };
  }
}
