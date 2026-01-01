"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  GuildSettingsSchema,
  GuildSettingsParams,
} from "@/lib/schema/guild/settings";

/**
 * ACTION: Updates Guild
 */
export async function updateGuild(
  params: GuildSettingsParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = GuildSettingsSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { guildId, accessToken, ...rest } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // validate user is guild leader or officer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        guildLed: { select: { id: true }, where: { id: guildId } },
        guildMembership: {
          select: { id: true },
          where: { guildId, role: { not: "MEMBER" } },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Forbidden" };
    }

    if (!user.guildLed && !user.guildMembership) {
      return { success: false, error: "Unauthorized" };
    }

    // Create resonant anchor record
    const updatedGuild = await prisma.guild.update({
      data: {
        ...rest,
      },
      where: { id: guildId },
      select: { id: true },
    });

    // revalidate create path
    revalidatePath(`/guilds/${updatedGuild.id}`, "layout");

    return {
      success: true,
      data: updatedGuild,
    };
  } catch (error) {
    console.error("Error updating guild info:", error);
    return {
      success: false,
      error: "Failed to update guild",
    };
  }
}
