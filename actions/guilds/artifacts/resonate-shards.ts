"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { ResonateShardsSchema } from "@/lib/schema/guild/artifacts";
import { resonateShardsForArtifact } from "@/lib/api-helpers/server/guilds/artifacts";
import { ApiResponse } from "@/lib/schema/api";

/**
 * ACTION: Resonate Echo Shards toward artifact crafting
 *
 * Any guild member can resonate (attune) their shards toward crafting an artifact.
 * When total shards resonated reach the template cost, the artifact becomes eligible for crafting.
 *
 * Requirements:
 * - User must be guild member
 * - User must have sufficient echo shards
 * - Template must exist
 *
 * Effects:
 * - Deducts shards from user's GuildMember record
 * - Increments artifact's shardsBurnt counter
 * - Tracks contributor in contributors JSON
 * - Returns crafting progress
 */
export async function resonateShardsAction(input: unknown): Promise<
  ApiResponse<{
    shardsBurnt: number;
    required: number;
    percentage: number;
    isCrafted: boolean;
  }>
> {
  try {
    // Parse input
    const parsed = ResonateShardsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid input" };
    }

    const { guildId, templateId, shards, accessToken } = parsed.data;

    // Validate token
    const { username } = await verifyTokenAndGetUser(accessToken);

    // Resonate shards
    const result = await resonateShardsForArtifact({
      guildId,
      username,
      templateId,
      shardsToResonate: shards,
    });

    if (!result.success || !result.progress) {
      return { success: false, error: result.error };
    }

    revalidatePath(`/guilds/${guildId}/artifacts`);

    return {
      success: true,
      data: result.progress,
    };
  } catch (error) {
    console.error("Error resonating shards:", error);
    return { success: false, error: "Failed to resonate shards" };
  }
}
