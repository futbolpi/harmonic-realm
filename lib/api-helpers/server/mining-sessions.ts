import prisma from "@/lib/prisma";
import {
  MiningSession,
  MiningSessionAssets,
} from "@/lib/schema/mining-session";
import { getMasteryInfo } from "@/lib/utils/mastery";

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
  const [session, nodeTypeId] = await Promise.all([
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
      },
    }),
    prisma.node.findUnique({ where: { id: nodeId }, select: { typeId: true } }),
  ]);

  const masteryInfo = await getMasteryInfo(userId, prisma, nodeTypeId?.typeId);

  return { session, masteryInfo };
}
