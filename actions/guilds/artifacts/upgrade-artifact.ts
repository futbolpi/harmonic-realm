"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { UpgradeArtifactSchema } from "@/lib/schema/guild/artifacts";
import { ApiResponse } from "@/lib/schema/api";
import prisma from "@/lib/prisma";
import { getUpgradeCost } from "@/lib/utils/guild/artifact";

/**
 * ACTION: Upgrade crafted artifact to next level
 *
 * Increments artifact level (1-10). Requires enough shards resonated toward upgrade.
 * Only LEADER/OFFICER can trigger the upgrade finalization.
 *
 * Requirements:
 * - User must be guild LEADER or OFFICER
 * - Artifact must be crafted (level >= 1)
 * - Artifact level must be < 10
 * - Artifact shardsBurnt >= cost for next level
 * - Guild vault >= RESONANCE cost for next level
 *
 * Effects:
 * - Increments artifact level
 * - Resets shardsBurnt to 0 (for next upgrade cycle)
 * - Burns RESONANCE from vault
 * - Updates contributor tracking
 */
export async function upgradeArtifactAction(input: unknown): Promise<
  ApiResponse<{
    id: string;
    level: number;
    shardsBurnt: number;
  }>
> {
  try {
    // Parse input
    const parsed = UpgradeArtifactSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const { guildId, artifactId, accessToken } = parsed.data;

    // Validate token
    const { username } = await verifyTokenAndGetUser(accessToken);

    // Verify caller is LEADER or OFFICER
    const member = await prisma.guildMember.findFirst({
      where: {
        guildId,
        username,
        role: { in: ["LEADER", "OFFICER"] },
      },
      select: { username: true },
    });

    if (!member) {
      return {
        success: false,
        error: "Only LEADER/OFFICER can upgrade artifacts",
      };
    }

    // Get artifact with guild and template
    const artifact = await prisma.guildArtifact.findUnique({
      where: { id: artifactId },
      select: {
        guildId: true,
        id: true,
        level: true,
        shardsBurnt: true,
        template: {
          select: {
            echoShardsCost: true,
            resonanceCost: true,
          },
        },
        guild: { select: { vaultBalance: true } },
      },
    });

    if (!artifact) {
      return { success: false, error: "Artifact not found" };
    }

    // Verify artifact belongs to guild
    if (artifact.guildId !== guildId) {
      return {
        success: false,
        error: "Artifact does not belong to this guild",
      };
    }

    // Check artifact is crafted
    if (artifact.level === 0) {
      return { success: false, error: "Artifact not yet crafted" };
    }

    // Check max level
    if (artifact.level >= 10) {
      return { success: false, error: "Artifact already at max level (10)" };
    }

    // Get upgrade cost for next level
    const nextLevel = artifact.level + 1;
    const cost = getUpgradeCost({
      nextLevel,
      resonanceCost: artifact.template.resonanceCost,
      shardsCost: artifact.template.echoShardsCost,
    });

    if (!cost) {
      return { success: false, error: "Invalid upgrade level" };
    }

    // Check shards resonated (accumulated shardsBurnt toward upgrade)
    if (artifact.shardsBurnt < cost.shards) {
      return {
        success: false,
        error: `Insufficient shards resonated for upgrade (${artifact.shardsBurnt}/${cost.shards})`,
      };
    }

    // Check vault has resonance
    if (artifact.guild.vaultBalance < cost.resonance) {
      return {
        success: false,
        error: `Insufficient vault RESONANCE (need ${cost.resonance}, have ${artifact.guild.vaultBalance})`,
      };
    }

    // Upgrade in transaction
    const upgraded = await prisma.$transaction(async (tx) => {
      // Burn resonance from vault
      const updatedGuild = await tx.guild.update({
        where: { id: guildId },
        data: { vaultBalance: { decrement: cost.resonance } },
        select: { vaultBalance: true },
      });

      // create vault tx
      await tx.vaultTransaction.create({
        data: {
          amount: cost.resonance,
          balanceAfter: updatedGuild.vaultBalance,
          balanceBefore: updatedGuild.vaultBalance + cost.resonance,
          type: "WITHDRAWAL",
          memberUsername: username,
          reason: "Artifact upgrade payment",
          metadata: { artifactId: artifact.id },
        },
        select: { id: true },
      });

      // Increment level, reset shardsBurnt for next cycle
      return await tx.guildArtifact.update({
        where: { id: artifactId },
        data: {
          level: { increment: 1 },
          shardsBurnt: { decrement: cost.shards }, // Reset for next upgrade cycle
        },
        select: { id: true, level: true, shardsBurnt: true },
      });
    });

    revalidatePath(`/guilds/${guildId}/artifacts`);

    return {
      success: true,
      data: {
        id: upgraded.id,
        level: upgraded.level,
        shardsBurnt: upgraded.shardsBurnt,
      },
    };
  } catch (error) {
    console.error("Error upgrading artifact:", error);
    return { success: false, error: "Failed to upgrade artifact" };
  }
}
