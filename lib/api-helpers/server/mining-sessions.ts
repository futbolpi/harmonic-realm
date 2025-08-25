import prisma from "@/lib/prisma";
import {
  MiningSession,
  MiningSessionAssets,
} from "@/lib/schema/mining-session";
import { getMasteryInfo } from "@/lib/utils/mastery";
import { getUserEchoTransmission } from "./echoes";

export async function getMiningSession({
  nodeId,
  userId,
}: {
  nodeId: string;
  userId: string;
}): Promise<MiningSession> {
  return prisma.miningSession.findUnique({
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
  });
}

export async function getMiningSessionAssets({
  nodeId,
  userId,
}: {
  nodeId: string;
  userId: string;
}): Promise<MiningSessionAssets> {
  const [session, nodeTypeId, echoInfo] = await Promise.all([
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
    prisma.node.findUnique({ where: { id: nodeId }, select: { typeId: true } }),
    getUserEchoTransmission(userId),
  ]);

  const masteryInfo = await getMasteryInfo(userId, prisma, nodeTypeId?.typeId);

  return { session, masteryInfo, echoInfo };
}
