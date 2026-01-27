"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { CraftArtifactSchema } from "@/lib/schema/guild/artifacts";
import { completeCraftArtifact } from "@/lib/api-helpers/server/guilds/artifacts";
import { ApiResponse } from "@/lib/schema/api";
import prisma from "@/lib/prisma";

/**
 * ACTION: Complete artifact crafting (Officer only)
 *
 * Finalizes artifact crafting when community has resonated enough shards.
 * Sets artifact level from 0 → 1 and burns RESONANCE from vault.
 * Only LEADER/OFFICER can call this.
 *
 * Requirements:
 * - User must be guild LEADER or OFFICER
 * - Artifact shardsBurnt >= template.echoShardsCost
 * - Guild vault >= template.resonanceCost
 * - Artifact must be at level 0 (not already crafted)
 *
 * Effects:
 * - Sets artifact level to 1 (crafted)
 * - Resets shardsBurnt to 0 (for upgrade phase)
 * - Burns RESONANCE from vault
 */
export async function craftArtifactAction(input: unknown): Promise<
  ApiResponse<{
    id: string;
    level: number;
    shardsBurnt: number;
  }>
> {
  try {
    // Parse input
    const parsed = CraftArtifactSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const { guildId, templateId, accessToken } = parsed.data;

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
        error: "Only LEADER/OFFICER can complete artifact crafting",
      };
    }

    // Complete crafting
    const result = await completeCraftArtifact(guildId, templateId);

    if (!result.success || !result.artifact) {
      return { success: false, error: result.error };
    }

    revalidatePath(`/guilds/${guildId}/artifacts`);
    revalidatePath(`/guilds/${guildId}`);

    return {
      success: true,
      data: result.artifact,
    };
  } catch (error) {
    console.error("Error crafting artifact:", error);
    return { success: false, error: "Failed to craft artifact" };
  }
}
