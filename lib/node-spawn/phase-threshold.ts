import { subDays } from "date-fns";

import prisma from "@/lib/prisma";

/**
 * Updated: Calculates mining session threshold for phase p, dynamically scaling with active players for sustainability.
 * Lore: "Harmonic Convergence" – thresholds reflect the converging series of Pi, scaled by collective resonance (active players),
 * with logarithmic growth to ensure infinite yet challenging progression, preventing stagnation and encouraging global harmonization.
 * @param phase game phase
 * @returns mining session threshold
 */
export async function calculatePhaseThreshold(phase: number): Promise<number> {
  if (phase < 2)
    throw new Error("Phase must be at least 2 for threshold calculations");

  const pi = Math.PI; // Cosmic constant
  const baseline = 1_000;

  // Dynamic: Active players (e.g., unique users with sessions in last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const activePlayers = await prisma.miningSession
    .aggregate({
      where: { startTime: { gte: thirtyDaysAgo } },
      _count: { userId: true }, // Unique users
    })
    .then((agg) => agg._count.userId || 1); // Min 1

  const growthFactor = Math.log2(phase) * Math.sqrt(activePlayers); // Log for slow growth, sqrt for player scaling
  const threshold = Math.round(pi * baseline * growthFactor);

  // Caps for balance: Min 100k (achievable), max 10M (prevent overload)
  return Math.max(100_000, Math.min(10_000_000, threshold));
}
