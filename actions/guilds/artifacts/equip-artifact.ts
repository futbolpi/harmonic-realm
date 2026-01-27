"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { ApiResponse } from "@/lib/schema/api";
import prisma from "@/lib/prisma";
import { EquipArtifactSchema } from "@/lib/schema/guild/artifacts";
import { getArtifactSlots } from "@/lib/utils/guild/artifact";

/**
 * ACTION: Equip or unequip a crafted artifact
 *
 * Only LEADER/OFFICER can equip/unequip artifacts.
 * Artifact must be crafted (level > 0).
 *
 * Requirements:
 * - User must be guild LEADER or OFFICER
 * - Artifact must exist and belong to guild
 * - If equipping: must have available slots (based on vault level)
 * - Artifact must be crafted (level > 0)
 *
 * Effects:
 * - Toggles artifact equipped status
 * - Updates equippedAt timestamp
 */
export async function equipArtifactAction(input: unknown): Promise<
  ApiResponse<{
    id: string;
    isEquipped: boolean;
    level: number;
  }>
> {
  try {
    // Parse input
    const parsed = EquipArtifactSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const { guildId, artifactId, accessToken, equip } = parsed.data;

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
        error: "Only LEADER/OFFICER can equip artifacts",
      };
    }

    // Get artifact
    const artifact = await prisma.guildArtifact.findUnique({
      where: { id: artifactId },
      select: { guildId: true, level: true, isEquipped: true },
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

    // Check artifact is crafted (level > 0)
    if (artifact.level === 0) {
      return {
        success: false,
        error: "Cannot equip uncrafted artifact (still resonating shards)",
      };
    }

    // If equipping, check slot availability
    if (equip && !artifact.isEquipped) {
      const guild = await prisma.guild.findUnique({
        where: { id: guildId },
        select: { vaultLevel: true },
      });

      if (!guild) {
        return { success: false, error: "Guild not found" };
      }

      // Count equipped artifacts
      const equippedCount = await prisma.guildArtifact.count({
        where: { guildId, isEquipped: true },
      });

      const maxSlots = getArtifactSlots(guild.vaultLevel);

      if (equippedCount >= maxSlots) {
        return {
          success: false,
          error: `All artifact slots full (${maxSlots}/${maxSlots})`,
        };
      }
    }

    // Update artifact
    const updated = await prisma.guildArtifact.update({
      where: { id: artifactId },
      data: {
        isEquipped: equip,
        equippedAt: equip ? new Date() : null,
      },
      include: { template: true },
    });

    revalidatePath(`/guilds/${guildId}/artifacts`);
    revalidatePath(`/guilds/${guildId}`);

    return {
      success: true,
      data: {
        id: updated.id,
        isEquipped: updated.isEquipped,
        level: updated.level,
      },
    };
  } catch (error) {
    console.error("Error equipping artifact:", error);
    return { success: false, error: "Failed to equip artifact" };
  }
}
