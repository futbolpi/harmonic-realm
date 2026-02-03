import { startOfToday } from "date-fns";

import prisma from "@/lib/prisma";
import { MiningSessionAssets } from "@/lib/schema/mining-session";
import { getMasteryInfo } from "@/lib/utils/mastery";
import { getUserEchoTransmission } from "./echoes";
import { getChamberBoostForLocation } from "./chamber-helpers";

export async function getMiningSessionAssets({
  nodeId,
  userId,
}: {
  nodeId: string;
  userId: string;
}): Promise<MiningSessionAssets> {
  const todayStart = startOfToday();

  const [session, node, echoInfo, playCount, user] = await Promise.all([
    prisma.miningSession.findUnique({
      where: { userId_nodeId: { nodeId, userId } },
      select: {
        createdAt: true,
        endTime: true,
        id: true,
        minerSharesEarned: true,
        startTime: true,
        status: true,
        updatedAt: true,
        echoTransmissionApplied: true,
        timeReductionPercent: true,
      },
    }),
    prisma.node.findUnique({
      where: { id: nodeId },
      select: { typeId: true, latitude: true, longitude: true },
    }),
    getUserEchoTransmission(userId),
    prisma.tuningSession.count({
      where: {
        userId,
        nodeId,
        timestamp: { gte: todayStart },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyStreak: true },
    }),
  ]);

  const masteryInfo = await getMasteryInfo(userId, prisma, node?.typeId);
  const chamberBonus = await getChamberBoostForLocation({
    userId,
    latitude: node?.latitude,
    longitude: node?.longitude,
  });

  return {
    session,
    masteryInfo,
    echoInfo,
    tuningSession: { playCount, currentStreak: user?.dailyStreak ?? 0 },
    chamberBonus,
  };
}
