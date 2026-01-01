"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  RemoveMemberParams,
  RemoveMemberSchema,
} from "@/lib/schema/guild/update-role";

/**
 * ACTION: Removes member from guild (set user guild to null/ deletes membership)
 */
export async function removeMember(
  params: RemoveMemberParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = RemoveMemberSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, memberId } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // validate user is guild leader
    const leader = await prisma.user.findUnique({
      where: { id: userId, guildLed: { members: { some: { id: memberId } } } },
      select: {
        id: true,
        guildMembership: { select: { id: true } },
      },
    });

    if (!leader) {
      return { success: false, error: "Forbidden" };
    }

    if (leader.guildMembership?.id === memberId) {
      return {
        success: false,
        error: "Cannot remove self from guild",
      };
    }

    // Delete guild membership
    const deletedGuildMember = await prisma.guildMember.delete({
      where: { id: memberId },
      select: { guildId: true },
    });

    // revalidate guild path
    revalidatePath(`/guilds/${deletedGuildMember.guildId}`, "layout");

    return {
      success: true,
      data: { id: memberId },
    };
  } catch (error) {
    console.error("Error removing member from guild:", error);
    return {
      success: false,
      error: "Failed to remove member from guild",
    };
  }
}
