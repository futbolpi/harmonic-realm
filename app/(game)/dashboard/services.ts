import { format } from "date-fns";

import prisma from "@/lib/prisma";

export const getSurgeData = async () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const todaySurges = await prisma.resonanceSurge.findMany({
    where: { spawnCycle: today },
    select: { isStabilized: true, expiresAt: true, hexRank: true },
    orderBy: { spawnedAt: "asc" },
  });

  const activeCount = todaySurges.filter((sg) => !sg.isStabilized).length;
  const stabilizedCount = todaySurges.filter((sg) => sg.isStabilized).length;
  const oldestSurge = todaySurges.length > 0 ? todaySurges[0] : null;

  const surgeData = {
    activeCount,
    stabilizedCount,
    oldestSurge,
  };

  return surgeData;
};
