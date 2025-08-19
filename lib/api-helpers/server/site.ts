import prisma from "@/lib/prisma";

export const getSiteStats = async () => {
  const [latestPhase, sessionsCompleted] = await Promise.all([
    prisma.gamePhase.findFirst({
      orderBy: { phaseNumber: "desc" },
    }),
    prisma.miningSession.count({
      where: { status: "COMPLETED", endTime: { not: null } },
    }),
  ]);
  return { latestPhase, sessionsCompleted };
};
