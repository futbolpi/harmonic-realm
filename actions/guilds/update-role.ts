"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  UpdateRoleParams,
  UpdateRoleSchema,
} from "@/lib/schema/guild/update-role";

/**
 * ACTION: Updates guild member role (promotes or demote member)
 */
export async function updateRole(
  params: UpdateRoleParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = UpdateRoleSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, memberId, role } = data;

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
        error: `Cannot ${role === "MEMBER" ? "Demote" : "Promote"} self`,
      };
    }

    // Update member record with new role
    const updatedGuildMember = await prisma.guildMember.update({
      data: {
        role,
      },
      where: { id: memberId },
      select: { guildId: true },
    });

    // revalidate guild path
    revalidatePath(`/guilds/${updatedGuildMember.guildId}`, "layout");

    return {
      success: true,
      data: { id: memberId },
    };
  } catch (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      error: "Failed to update member role",
    };
  }
}
