import prisma from "@/lib/prisma";
import { MiningSession } from "@/lib/schema/mining-session";

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
