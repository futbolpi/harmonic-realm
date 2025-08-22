import { calculatePhaseThreshold } from "@/lib/node-spawn/phase-threshold";
import prisma from "@/lib/prisma";

export const getSiteStats = async () => {
  const [
    latestPhase,
    sessionsCompleted,
    topPioneers,
    pioneersAggregate,
    noOfNodes,
  ] = await Promise.all([
    prisma.gamePhase.findFirst({
      orderBy: { phaseNumber: "desc" },
    }),
    prisma.miningSession.count({
      where: { status: "COMPLETED", endTime: { not: null } },
    }),
    prisma.user.findMany({
      select: {
        level: true,
        id: true,
        username: true,
        sharePoints: true,
        xp: true,
      },
      orderBy: { sharePoints: "desc" },
      take: 50,
    }),
    prisma.user.aggregate({
      _sum: { sharePoints: true, totalEarned: true },
      _count: { id: true },
      _avg: { sharePoints: true, totalEarned: true, level: true, xp: true },
    }),
    prisma.node.count(),
  ]);

  const leaderboard = topPioneers.map((pioneer, index) => ({
    ...pioneer,
    rank: index + 1,
  }));

  const nextPhaseThreshold = await calculatePhaseThreshold(
    latestPhase?.phaseNumber || 2
  );

  return {
    latestPhase,
    sessionsCompleted,
    leaderboard,
    pioneersAggregate,
    nextPhaseThreshold,
    noOfNodes,
  };
};
