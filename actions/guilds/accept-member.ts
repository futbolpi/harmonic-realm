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
 * ACTION: Accepts member request (set user guildMember to isActive)
 */
export async function acceptMember(
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
        guildLed: {
          select: { maxMembers: true, _count: { select: { members: true } } },
        },
      },
    });

    if (!leader?.guildLed) {
      return { success: false, error: "Forbidden" };
    }

    // ensure it is within guild membership limit
    if (leader.guildLed.maxMembers >= leader.guildLed._count.members) {
      return { success: false, error: "Guild membership limit reached" };
    }

    // Update member record to is active
    const acceptedGuildMember = await prisma.guildMember.update({
      where: { id: memberId },
      select: { guildId: true },
      data: {
        isActive: true,
        joinedAt: new Date(),
        challengeCompletions: 0,
        totalSharePoints: 0,
        vaultContribution: 0,
        weeklySharePoints: 0,
        vaultTransactions: {
          updateMany: {
            where: { archivedAt: null },
            data: { archivedAt: new Date() },
          },
        },
      },
    });

    // revalidate guild path
    revalidatePath(`/guilds/${acceptedGuildMember.guildId}`, "layout");

    return {
      success: true,
      data: { id: memberId },
    };
  } catch (error) {
    console.error("Error accepting member:", error);
    return {
      success: false,
      error: "Failed to accept member",
    };
  }
}
