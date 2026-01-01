"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  CreateGuildSchema,
  CreateGuildParams,
} from "@/lib/schema/guild/create";

/**
 * ACTION: Creates Guild (creates payment intent)
 */
export async function createGuild(
  params: CreateGuildParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = CreateGuildSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { name, accessToken, ...rest } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // get already existing guild with name
    const nameTaken = await prisma.guild.findUnique({
      where: { name },
      select: { id: true },
    });

    // validate user has no guild
    const leader = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        guildLed: { select: { id: true } },
      },
    });

    if (!leader) {
      return { success: false, error: "Forbidden" };
    }

    if (nameTaken) {
      return { success: false, error: "✕ Name taken" };
    }

    if (leader.guildLed) {
      return { success: true, data: leader.guildLed };
    }

    // Create guild record
    const newGuild = await prisma.guild.create({
      data: {
        ...rest,
        name,
        leaderUsername: leader.username,
      },
      select: { id: true },
    });

    // revalidate create path
    revalidatePath("/guilds/create");

    return {
      success: true,
      data: newGuild,
    };
  } catch (error) {
    console.error("Error creating new guild:", error);
    return {
      success: false,
      error: "Failed to create new guild",
    };
  }
}
