"use server";

import { revalidatePath } from "next/cache";

import { awardXp, verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";
import {
  CompleteMiningRequest,
  CompleteMiningSchema,
  CompleteMiningResponse,
} from "@/lib/schema/mining-session";
import { calculateMinerShares, calculateMiningXp } from "@/lib/utils/mining";

export const completeMiningSession = async (
  params: CompleteMiningRequest
): Promise<ApiResponse<CompleteMiningResponse>> => {
  try {
    const { success, data } = CompleteMiningSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, sessionId } = data;

    const { id: userId } = await verifyTokenAndGetUser(accessToken);

    // 1. Fetch session with related data

    const session = await prisma.miningSession.findUnique({
      where: {
        id: sessionId,
        endTime: null,
        status: "ACTIVE",
        userId,
      },
      select: {
        startTime: true,
        nodeId: true,
        node: {
          select: {
            openForMining: true,
            typeId: true,
            type: {
              select: {
                baseYieldPerMinute: true,
                lockInMinutes: true,
                maxMiners: true,
              },
            },
            _count: {
              select: { sessions: { where: { status: "COMPLETED" } } },
            },
          },
        },
      },
    });

    // Check if node is available
    if (!session?.node.openForMining) {
      return {
        success: false,
        error: "Node is not currently active",
      };
    }

    // 2. Compute durations and constraints

    const lockInDurationMs = session.node.type.lockInMinutes * 60 * 1000;
    const now = new Date();
    const leastLockinTime = session.startTime.getTime() + lockInDurationMs;

    // ensure now > startTime + nodeType lockInMinutes
    if (now.getTime() <= leastLockinTime) {
      return {
        success: false,
        error: "Mining session is not complete",
      };
    }

    // check completedSessions < maxMiners
    if (session.node.type.maxMiners >= session.node._count.sessions) {
      return {
        success: false,
        error: "Node is at maximum capacity",
      };
    }

    // 3. Gather upgrade & mastery bonuses

    const [upgrades, mastery] = await Promise.all([
      prisma.userNodeUpgrade.findMany({ where: { userId } }),
      prisma.userNodeMastery.findFirst({
        where: {
          userId,
          nodeTypeId: session.node.typeId,
        },
      }),
    ]);

    const upgradeBonusPct = upgrades.reduce((sum, u) => sum + u.effectPct, 0);
    const masteryBonusPct = mastery ? (mastery.level - 1) * 0.01 : 0;
    // add algorithm later
    const miniTaskMultiplier = 1;

    // 4. Calculate shares & XP
    const sharesEarned = calculateMinerShares({
      baseYieldPerMinute: session.node.type.baseYieldPerMinute,
      durationMinutes: session.node.type.lockInMinutes,
      upgradeBonusPct,
      masteryBonusPct,
      miniTaskMultiplier,
      maxMiners: session.node.type.maxMiners,
      activeMiners: session.node._count.sessions,
    });

    const xpGained = calculateMiningXp({
      durationMinutes: session.node.type.lockInMinutes,
      upgradeBonusPct,
      masteryBonusPct,
      miniTaskMultiplier,
    });

    // 5. Persist all changes atomically
    await prisma.$transaction([
      prisma.miningSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime: now,
          minerSharesEarned: sharesEarned,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          sharePoints: { increment: sharesEarned },
        },
      }),
    ]);

    // 6. Award XP & handle level-up
    await awardXp(userId, xpGained);

    // 7. Revalidate pages showing balances & levels
    revalidatePath("/");
    revalidatePath(`/nodes/${session.nodeId}`);

    return { success: true, data: { sharesEarned, xpGained } };
  } catch (error) {
    console.error("Complete mining action error:", error);
    return {
      success: false,
      error: "Failed to complete mining session",
    };
  }
};
