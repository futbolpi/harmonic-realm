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
import {
  awardMemberSP,
  getMemberBonus,
} from "@/lib/api-helpers/server/guilds/share-points-helpers";
import { addEchoShards } from "@/lib/api-helpers/server/guilds/artifacts";
import { contributeToChallengeScore } from "@/lib/api-helpers/server/guilds/territories";
import { updateChallengeProgress } from "@/lib/api-helpers/server/guilds/challenges";
import {
  applyChamberBoost,
  getChamberBoostForLocation,
} from "@/lib/api-helpers/server/chamber-helpers";
import { stabilizeSurgeNode } from "@/lib/api-helpers/server/resonance-surge/stabilize-node";

export const completeMiningSession = async (
  params: CompleteMiningRequest,
): Promise<ApiResponse<CompleteMiningResponse>> => {
  try {
    const { success, data } = CompleteMiningSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, sessionId, userLatitude, userLongitude } = data;

    const {
      id: userId,
      username,
      archivedAt,
    } = await verifyTokenAndGetUser(accessToken);

    // Validate against spoofing
    const isValid = await validateGeolocation({
      submittedLat: userLatitude,
      submittedLng: userLongitude,
      avoidRapidFire: true,
      userId,
    });

    if (!isValid || !!archivedAt) {
      return {
        success: false,
        error: "Forbidden: Location verification failed",
      };
    }

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
            genEvent: true,
            territory: {
              select: {
                id: true,
                hexId: true,
                guildId: true,
                activeChallengeId: true,
              },
            },
            type: {
              select: {
                baseYieldPerMinute: true,
                lockInMinutes: true,
                maxMiners: true,
                rarity: true,
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

    // 3. Gather upgrade, guild, sponsor & mastery bonuses

    const [mastery, guildBonus, chamberBonus] = await Promise.all([
      prisma.userNodeMastery.findUnique({
        where: {
          user_node_mastery_unique: { userId, nodeTypeId },
        },
        select: { bonusPercent: true },
      }),
      getMemberBonus(username),
      getChamberBoostForLocation({
        userId,
        latitude: session.node.latitude,
        longitude: session.node.longitude,
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
      guildBonus: guildBonus.level?.sharePointsBonus || 0,
    });

    const xpGained = calculateMiningXp({
      durationMinutes,
      masteryBonusPct,
      miniTaskMultiplier,
    });

    const { latitudeBin, longitudeBin } = binLatLon(
      session.node.latitude,
      session.node.longitude,
    );

    // Territory bonus: +15% sharePoints if node is in a territory controlled by the user's active guild
    let finalShares = sharesEarned;
    if (session.node.territory?.guildId) {
      if (session.node.territory.guildId === guildBonus.member?.guild.id) {
        const territoryBonus = parseFloat((sharesEarned * 0.15).toFixed(4));
        finalShares = parseFloat((sharesEarned + territoryBonus).toFixed(4));
      }
    }

    if (chamberBonus.hasBoost) {
      finalShares = applyChamberBoost(
        finalShares,
        chamberBonus.boostMultiplier,
      );
    }

    if (session.node.genEvent === "ResonanceSurge") {
      finalShares = finalShares * 2;
    }

    // 5. Persist all changes atomically
    await prisma.$transaction([
      prisma.miningSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime: now,
          minerSharesEarned: finalShares,
          latitudeBin,
          longitudeBin,
        },
        select: { id: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          sharePoints: { increment: finalShares },
        },
        select: { id: true },
      }),
    ]);

    // 6. Award XP, member SP and mastery & handle level-up
    // get returned value for good user experience
    await Promise.all([
      awardXp(userId, xpGained),
      updateMasteryProgression(userId, nodeTypeId, 1, prisma),
      awardMemberSP({
        memberId: guildBonus.member?.id,
        sharePoints: finalShares,
        completedMining: true,
      }),
    ]);

    if (guildBonus.member) {
      //7a. Award echo shards based on node rarity and shares earned
      addEchoShards(guildBonus.member.guild.id, username, "MINING", {
        sharesEarned: finalShares,
        nodeRarity: session.node.type.rarity,
      });

      //7b. Contributes to TOTAL_SHAREPOINTS and UNIQUE_NODES_MINED challenges
      await updateChallengeProgress({
        guildId: guildBonus.member.guild.id,
        username,
        updates: {
          sharePoints: finalShares, // Contributes to TOTAL_SHAREPOINTS
          nodesMined: 1, // Each mining session counts as 1 node
        },
      });
    }

    // 8. If territory is under challenge, contribute to it (best-effort)
    try {
      if (!!session.node.territory?.activeChallengeId) {
        await contributeToChallengeScore(session.nodeId, username, finalShares);
      }
    } catch (e) {
      console.warn("Failed to add territory contribution", e);
    }

    // 9. check if user is eligible for Surge Survivor achievement
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

    // 10. Stabilize Surge node on first mine
    if (session.node.genEvent === "ResonanceSurge") {
      await stabilizeSurgeNode(session.nodeId, username);
    }

    // 11. call the achievement unlock workflow
    await inngest.send({
      name: "game.achievement.check",
      data: { eventType: "miningCompleted", userId },
    });

    // 12. Revalidate pages showing balances & levels
    revalidatePath("/");
    revalidatePath(`/nodes/${session.nodeId}`);

    return { success: true, data: { finalShares, xpGained, chamberBonus } };
  } catch (error) {
    console.error("Complete mining action error:", error);
    return {
      success: false,
      error: "Failed to complete mining session",
    };
  }
};
