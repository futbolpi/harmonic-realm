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
import { binLatLon } from "@/lib/node-spawn/region-metrics";
import { inngest } from "@/inngest/client";
import { updateMasteryProgression } from "@/lib/utils/mastery";
import { validateGeolocation } from "@/lib/api-helpers/server/utils/validate-geolocation";

export const completeMiningSession = async (
  params: CompleteMiningRequest
): Promise<ApiResponse<CompleteMiningResponse>> => {
  try {
    const { success, data } = CompleteMiningSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, sessionId, userLatitude, userLongitude } = data;

    // Validate against spoofing
    const isValid = await validateGeolocation(userLatitude, userLongitude);

    if (!isValid) {
      return {
        success: false,
        error: "Forbidden: Location verification failed",
      };
    }

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
        echoTransmissionApplied: true,
        timeReductionPercent: true,
        nodeId: true,
        node: {
          select: {
            openForMining: true,
            typeId: true,
            latitude: true,
            longitude: true,
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

    const completedSessions = session.node._count.sessions;
    const maxMiners = session.node.type.maxMiners;
    const activeMiners = completedSessions + 1;
    const durationMinutes = session.node.type.lockInMinutes;
    const nodeTypeId = session.node.typeId;

    // 2. Compute durations and constraints

    const lockInDurationMs = durationMinutes * 60 * 1000;
    const now = new Date();
    let leastLockinTime = session.startTime.getTime() + lockInDurationMs;

    // reduce least lockintime if echoTransmissionApplied
    if (!!session.echoTransmissionApplied && session.timeReductionPercent > 0) {
      leastLockinTime = leastLockinTime * (session.timeReductionPercent / 100);
    }

    // ensure now > startTime + nodeType lockInMinutes
    if (now.getTime() <= leastLockinTime) {
      return {
        success: false,
        error: "Mining session is not complete",
      };
    }

    // check completedSessions < maxMiners
    if (completedSessions >= maxMiners) {
      return {
        success: false,
        error: "Node is at maximum capacity",
      };
    }

    // 3. Gather upgrade, sponsor & mastery bonuses

    const [mastery] = await Promise.all([
      prisma.userNodeMastery.findUnique({
        where: {
          user_node_mastery_unique: { userId, nodeTypeId },
        },
        select: { bonusPercent: true },
      }),
    ]);

    const masteryBonusPct = mastery ? mastery.bonusPercent : 0;

    // add algorithm later
    const miniTaskMultiplier = 1;

    // 4. Calculate shares, binlatlol & XP
    const sharesEarned = calculateMinerShares({
      baseYieldPerMinute: session.node.type.baseYieldPerMinute,
      durationMinutes,
      masteryBonusPct,
      miniTaskMultiplier,
      maxMiners,
      activeMiners,
    });

    const xpGained = calculateMiningXp({
      durationMinutes,
      masteryBonusPct,
      miniTaskMultiplier,
    });

    const { latitudeBin, longitudeBin } = binLatLon(
      session.node.latitude,
      session.node.longitude
    );

    // 5. Persist all changes atomically
    await prisma.$transaction([
      prisma.miningSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime: now,
          minerSharesEarned: sharesEarned,
          latitudeBin,
          longitudeBin,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          sharePoints: { increment: sharesEarned },
        },
      }),
    ]);

    // 6. Award XP and mastery & handle level-up
    // get returned value for good user experience
    await Promise.all([
      awardXp(userId, xpGained),
      updateMasteryProgression(userId, nodeTypeId, 1, prisma),
    ]);

    // 7. check if user is eligible for Surge Survivor achievement
    if (activeMiners === maxMiners) {
      const surgeAchievement = await prisma.achievement.findUnique({
        where: { name: "Surge Survivor" }, // Assuming this achievement exists from seed
      });
      if (surgeAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: surgeAchievement.id,
            },
          },
          update: {},
          create: {
            userId,
            achievementId: surgeAchievement.id,
            unlockedAt: new Date(),
          },
        });
      }
    }

    // 8. call the achievement unlock workflow
    await inngest.send({
      name: "game.achievement.check",
      data: { eventType: "miningCompleted", userId },
    });

    // 9. Revalidate pages showing balances & levels
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
