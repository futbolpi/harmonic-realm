"use server";

import { revalidatePath } from "next/cache";

import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import { JoinGuildParams, JoinGuildSchema } from "@/lib/schema/guild/join";
import { canUserJoin } from "@/lib/guild/utils";

/**
 * ACTION: Sends guild member request (creates guild member)
 */
export async function joinGuild(
  params: JoinGuildParams
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { success, data } = JoinGuildSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, guildId } = data;

    // Verify user authentication
    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    const [user, guild] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          guildMembership: { select: { id: true }, where: { isActive: true } },
          resonanceFidelity: true,
          guildLed: { select: { id: true } },
          username: true,
        },
      }),
      prisma.guild.findUnique({
        where: { id: guildId, piTransactionId: { not: null } },
        select: {
          maxMembers: true,
          minRF: true,
          requireApproval: true,
          _count: { select: { members: true } },
        },
      }),
    ]);

    if (!user || !guild) {
      return { success: false, error: "Forbidden" };
    }

    const { canJoin, reason } = canUserJoin({
      guild: {
        minRF: guild.minRF,
        maxMembers: guild.maxMembers,
        noOfMembers: guild._count.members,
      },
      hasActiveMembership: !!user.guildMembership,
      userRF: user.resonanceFidelity,
    });

    if (!canJoin) {
      return { success: false, error: reason };
    }

    if (user.guildLed?.id === guildId) {
      return { success: false, error: "Cannot join guild you lead" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.guildMember.upsert({
        where: { username: user.username },
        create: {
          username: user.username,
          // make membership isactive false if guild requires permission
          isActive: !guild.requireApproval,
          guildId,
          role: "MEMBER",
        },
        update: {
          role: "MEMBER",
          vaultContribution: 0,
          weeklySharePoints: 0,
          challengeCompletions: 0,
          totalSharePoints: 0,
          guildId,
          isActive: !guild.requireApproval,
          joinedAt: new Date(),
          vaultTransactions: {
            updateMany: {
              data: { archivedAt: new Date() },
              where: { archivedAt: null },
            },
          },
        },
      });
      // upsert guild membership and delete leadership guild if user has

      if (user.guildLed) {
        await prisma.guild.delete({
          where: { id: user.guildLed.id },
        });
      }
    });

    // revalidate guild path
    revalidatePath(`/guilds/${guildId}`, "layout");

    return {
      success: true,
      data: { id: guildId },
    };
  } catch (error) {
    console.error("Error joining guild:", error);
    return {
      success: false,
      error: "Failed to join guild",
    };
  }
}
