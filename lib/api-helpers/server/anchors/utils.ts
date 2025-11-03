import { BIN_SIZE, binLatLon } from "@/lib/node-spawn/region-metrics";
import prisma from "@/lib/prisma";

/**
 * Validate that phase is active and anchoring is allowed
 */
export async function validatePhaseActive(
  gamePhaseId: number
): Promise<{ valid: boolean; error?: string }> {
  const phase = await prisma.gamePhase.findUnique({
    where: { id: gamePhaseId },
    select: { endTime: true },
  });

  if (!phase) {
    return { valid: false, error: "Phase not found" };
  }
  if (phase.endTime !== null) {
    return { valid: false, error: "Phase has ended" };
  }
  return { valid: true };
}

/**
 * Check if location already has too many anchors (prevents spam in single bin)
 */
export async function validateLocationDensity(
  lat: number,
  lon: number,
  phaseId: number,
  maxAnchorsPerBin = 5
): Promise<{ valid: boolean; error?: string }> {
  const { latitudeBin, longitudeBin } = binLatLon(lat, lon);

  const count = await prisma.resonantAnchor.count({
    where: {
      phaseId,
      locationLat: {
        gte: latitudeBin,
        lt: latitudeBin + BIN_SIZE,
      },
      locationLon: {
        gte: longitudeBin,
        lt: longitudeBin + BIN_SIZE,
      },
      paymentStatus: "COMPLETED",
    },
  });

  if (count >= maxAnchorsPerBin) {
    return {
      valid: false,
      error: `Maximum anchors (${maxAnchorsPerBin}) reached in this location`,
    };
  }

  return { valid: true };
}

/**
 * Calculate global anchor index (A_G) for a given phase
 * Returns the count of ResonantAnchor records with completed payments
 */
export async function calculateGlobalAnchorIndex(
  phaseId: number
): Promise<number> {
  const count = await prisma.resonantAnchor.count({
    where: {
      phaseId,
      paymentStatus: "COMPLETED",
    },
  });
  return count;
}
