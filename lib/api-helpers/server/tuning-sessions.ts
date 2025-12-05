import { startOfToday } from "date-fns";

import prisma from "@/lib/prisma";
import { isWithinMiningRange } from "@/lib/utils";
import { NODE_TUNING_DAILY_CAP } from "@/config/site";

interface TuningEligibilityParams {
  nodeId: string;
  userId: string;
  userLat: number;
  userLng: number;
}

/**
 * Validates eligibility.
 * Optimized to fetch only necessary geometry and ticket data.
 */
export async function checkTuningEligibility({
  nodeId,
  userId,
  userLat,
  userLng,
}: TuningEligibilityParams) {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: {
      latitude: true,
      longitude: true,
      type: { select: { baseYieldPerMinute: true } },
      sponsor: true,
    },
  });

  if (!node) return { eligible: false, reason: "Signal lost." };

  // 1. Geometry
  const withinRange = isWithinMiningRange(
    userLat,
    userLng,
    node.latitude,
    node.longitude
  );

  if (!withinRange) {
    return { eligible: false, reason: "Out of range." };
  }

  // 2. Mining Ticket
  const ticket = await prisma.miningSession.findUnique({
    where: {
      status: "COMPLETED",
      endTime: { not: null }, // 3-hour window
      userId_nodeId: { nodeId, userId },
    },
    select: { id: true },
  });

  if (!ticket)
    return { eligible: false, reason: "Resonance ticket expired. Mine first." };

  // 3. Daily Throttle
  const todayStart = startOfToday();
  const playCount = await prisma.tuningSession.count({
    where: {
      userId,
      nodeId,
      timestamp: { gte: todayStart },
    },
  });

  if (playCount >= NODE_TUNING_DAILY_CAP)
    return { eligible: false, reason: "Daily resonance limit reached." };

  // get sponsor PiId for landlord Tax
  let sponsorPiId: string | null = null;

  if (!!node.sponsor) {
    const nodeAnchor = await prisma.resonantAnchor.findUnique({
      where: { id: node.sponsor },
      select: { userId: true },
    });
    sponsorPiId = nodeAnchor ? nodeAnchor.userId : null;
  }

  return {
    eligible: true,
    baseYield: node.type.baseYieldPerMinute,
    sponsorPiId,
  };
}
