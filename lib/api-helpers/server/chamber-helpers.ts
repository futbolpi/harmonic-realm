import prisma from "@/lib/prisma";
import {
  calculateChamberBoost,
  calculateCurrentDurability,
  isWithinChamberRadius,
} from "@/lib/utils/chambers";

/**
 * Get active chamber boosts for a location
 * Returns the highest boost available from any nearby chamber
 *
 * Performance: Uses spatial index (lat/lng) for bounding box query,
 * then filters in-memory for exact radius check
 */
export async function getChamberBoostForLocation({
  userId,
  latitude,
  longitude,
}: {
  userId: string;
  latitude?: number;
  longitude?: number;
}): Promise<{
  hasBoost: boolean;
  boostMultiplier: number;
  chamberId?: string;
  chamberLevel?: number;
}> {
  if (!latitude || !longitude) {
    return { hasBoost: false, boostMultiplier: 0 };
  }

  try {
    // Bounding box query (5km = ~0.045 degrees lat/lng at equator)
    const latDelta = 0.05; // Slightly larger to account for latitude scaling
    const lngDelta = 0.05;

    const nearbyChambers = await prisma.echoResonanceChamber.findMany({
      where: {
        userId,
        isActive: true,
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lngDelta,
          lte: longitude + lngDelta,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        level: true,
        lastMaintenanceAt: true,
        durability: true,
      },
    });

    if (nearbyChambers.length === 0) {
      return { hasBoost: false, boostMultiplier: 0 };
    }

    // Filter chambers within exact 5km radius and with >0% durability
    const activeChambers = nearbyChambers.filter((chamber) => {
      const currentDurability = calculateCurrentDurability(
        chamber.lastMaintenanceAt,
      );
      return (
        currentDurability > 0 &&
        isWithinChamberRadius(
          chamber.latitude,
          chamber.longitude,
          latitude,
          longitude,
        )
      );
    });

    if (activeChambers.length === 0) {
      return { hasBoost: false, boostMultiplier: 0 };
    }

    // Find highest level chamber (max boost)
    const bestChamber = activeChambers.reduce((prev, current) =>
      current.level > prev.level ? current : prev,
    );

    const boostMultiplier = calculateChamberBoost(bestChamber.level);

    return {
      hasBoost: true,
      boostMultiplier,
      chamberId: bestChamber.id,
      chamberLevel: bestChamber.level,
    };
  } catch (error) {
    console.error("Error fetching chamber boost:", error);
    return { hasBoost: false, boostMultiplier: 0 };
  }
}

/**
 * Apply chamber boost to sharePoints calculation
 * Returns boosted amount if chamber exists, otherwise original amount
 */
export function applyChamberBoost(
  baseShares: number,
  boostMultiplier: number,
): number {
  if (boostMultiplier <= 0) return baseShares;
  return parseFloat((baseShares * (1 + boostMultiplier)).toFixed(4));
}

/**
 * Get all active chambers for a user
 * Includes real-time durability calculation
 */
export async function getUserActiveChambers(userId: string) {
  const chambers = await prisma.echoResonanceChamber.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      level: true,
      totalResonanceInvested: true,
      lastMaintenanceAt: true,
      maintenanceDueAt: true,
      durability: true,
      cosmeticTheme: true,
      isPremium: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Calculate real-time durability for each chamber
  return chambers.map((chamber) => ({
    ...chamber,
    currentDurability: calculateCurrentDurability(chamber.lastMaintenanceAt),
    boost: calculateChamberBoost(chamber.level),
  }));
}

/**
 * Get chamber details by ID with real-time durability
 */
export async function getChamberById(chamberId: string) {
  const chamber = await prisma.echoResonanceChamber.findUnique({
    where: { id: chamberId },
    select: {
      id: true,
      userId: true,
      latitude: true,
      longitude: true,
      h3Index: true,
      level: true,
      totalResonanceInvested: true,
      durability: true,
      lastMaintenanceAt: true,
      maintenanceDueAt: true,
      cosmeticTheme: true,
      isPremium: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          username: true,
          piId: true,
        },
      },
    },
  });

  if (!chamber) return null;

  const currentDurability = calculateCurrentDurability(
    chamber.lastMaintenanceAt,
  );
  const boost = calculateChamberBoost(chamber.level);

  return {
    ...chamber,
    currentDurability,
    boost,
  };
}

/**
 * Get chamber maintenance history
 */
export async function getChamberMaintenanceHistory(
  chamberId: string,
  limit: number = 20,
) {
  return await prisma.chamberMaintenanceLog.findMany({
    where: { chamberId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      resonanceSpent: true,
      durabilityRestored: true,
      durabilityBefore: true,
      durabilityAfter: true,
      createdAt: true,
    },
  });
}

/**
 * Get chamber upgrade history
 */
export async function getChamberUpgradeHistory(
  chamberId: string,
  limit: number = 20,
) {
  return await prisma.chamberUpgradeLog.findMany({
    where: { chamberId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      fromLevel: true,
      toLevel: true,
      resonanceCost: true,
      createdAt: true,
    },
  });
}

/**
 * Get chambers for map display (all active chambers with minimal data)
 */
export async function getChambersForMap() {
  const chambers = await prisma.echoResonanceChamber.findMany({
    where: { isActive: true },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      level: true,
      lastMaintenanceAt: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return chambers.map((chamber) => ({
    id: chamber.id,
    latitude: chamber.latitude,
    longitude: chamber.longitude,
    level: chamber.level,
    username: chamber.user.username,
    currentDurability: calculateCurrentDurability(chamber.lastMaintenanceAt),
    boost: calculateChamberBoost(chamber.level),
  }));
}
