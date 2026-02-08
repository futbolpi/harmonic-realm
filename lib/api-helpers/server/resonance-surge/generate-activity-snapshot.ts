import { subDays } from "date-fns";
import Decimal from "decimal.js";

import { getH3Index } from "@/lib/utils/resonance-surge/h3-utils";
import { calculateHexScore } from "@/lib/utils/resonance-surge/activity-scoring";
import prisma from "@/lib/prisma";

/**
 * Generates activity snapshot for all hexes (last 7 days)
 * Called by daily Inngest workflow
 */
export async function generateActivitySnapshot(snapshotDate: string) {
  const windowEnd = new Date(snapshotDate);
  const windowStart = subDays(windowEnd, 7);

  // 1. Aggregate mining sessions by H3 hex
  const miningSessions = await prisma.miningSession.findMany({
    where: {
      startTime: { gte: windowStart, lte: windowEnd },
      status: "COMPLETED",
    },
    select: {
      node: { select: { latitude: true, longitude: true } },
    },
  });

  // 2. Aggregate tuning sessions by node location
  const tuningSessions = await prisma.tuningSession.findMany({
    where: {
      timestamp: { gte: windowStart, lte: windowEnd },
    },
    select: {
      node: { select: { latitude: true, longitude: true } },
    },
  });

  // 3. Aggregate anchoring (last 7 days)
  const resonantAnchors = await prisma.resonantAnchor.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      paymentStatus: "COMPLETED",
    },
    select: {
      locationLat: true,
      locationLon: true,
      piCost: true,
    },
  });

  // 4. Aggregate calibration contributions (last 7 days)
  const calibrationContributions = await prisma.awakeningContribution.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      paymentStatus: "COMPLETED",
    },
    select: {
      latitudeBin: true,
      longitudeBin: true,
      piContributed: true,
    },
  });

  // 5. Aggregate lore staking (last 7 days)
  const loreStakes = await prisma.locationLoreStake.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      paymentStatus: "COMPLETED",
    },
    select: {
      piAmount: true,
      locationLore: {
        select: {
          node: { select: { latitude: true, longitude: true } },
        },
      },
    },
  });

  // 6. Aggregate chamber maintenance (last 7 days)
  const maintainedChambers = await prisma.echoResonanceChamber.findMany({
    where: {
      lastMaintenanceAt: { gte: windowStart },
    },
    select: { latitude: true, longitude: true },
  });

  // 7. Aggregate node drifts (last 7 days)
  const nodeDrifts = await prisma.nodeDrift.findMany({
    where: {
      timestamp: { gte: windowStart, lte: windowEnd },
    },
    select: { originalLatitude: true, originalLongitude: true },
  });

  // 8. Group by H3 index
  const hexMap = new Map<
    string,
    {
      miningCount: number;
      tuningCount: number;
      anchoringCount: number;
      calibrationPi: number;
      loreStakingPi: number;
      chamberMaintenance: number;
      driftCount: number;
    }
  >();

  const defaultHex = {
    miningCount: 0,
    tuningCount: 0,
    anchoringCount: 0,
    calibrationPi: 0,
    loreStakingPi: 0,
    chamberMaintenance: 0,
    driftCount: 0,
  };

  // Mining
  miningSessions.forEach((session) => {
    const h3Index = getH3Index(session.node.latitude, session.node.longitude);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.miningCount++;
    hexMap.set(h3Index, hex);
  });

  // Tuning
  tuningSessions.forEach((session) => {
    const h3Index = getH3Index(session.node.latitude, session.node.longitude);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.tuningCount++;
    hexMap.set(h3Index, hex);
  });

  // Anchoring
  resonantAnchors.forEach((anchor) => {
    const h3Index = getH3Index(anchor.locationLat, anchor.locationLon);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.anchoringCount++;
    hexMap.set(h3Index, hex);
  });

  // Calibration (use binned locations)
  calibrationContributions.forEach((contrib) => {
    const h3Index = getH3Index(contrib.latitudeBin, contrib.longitudeBin);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.calibrationPi += contrib.piContributed.toNumber();
    hexMap.set(h3Index, hex);
  });

  // Lore staking
  loreStakes.forEach((stake) => {
    const h3Index = getH3Index(
      stake.locationLore.node.latitude,
      stake.locationLore.node.longitude,
    );
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.loreStakingPi += stake.piAmount.toNumber();
    hexMap.set(h3Index, hex);
  });

  // Chambers
  maintainedChambers.forEach((chamber) => {
    const h3Index = getH3Index(chamber.latitude, chamber.longitude);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.chamberMaintenance++;
    hexMap.set(h3Index, hex);
  });

  // Drifts
  nodeDrifts.forEach((drift) => {
    const h3Index = getH3Index(drift.originalLatitude, drift.originalLongitude);
    const hex = hexMap.get(h3Index) || defaultHex;
    hex.driftCount++;
    hexMap.set(h3Index, hex);
  });

  // 9. Calculate scores and store snapshots
  const snapshots = Array.from(hexMap.entries()).map(([h3Index, data]) => {
    const totalScore = calculateHexScore({
      h3Index,
      miningCount: data.miningCount,
      tuningCount: data.tuningCount,
      anchoringCount: data.anchoringCount,
      calibrationPi: new Decimal(data.calibrationPi),
      loreStakingPi: new Decimal(data.loreStakingPi),
      chamberMaintenance: data.chamberMaintenance,
      driftCount: data.driftCount,
    });

    return {
      h3Index,
      windowStart,
      windowEnd,
      miningCount: data.miningCount,
      tuningCount: data.tuningCount,
      anchoringCount: data.anchoringCount,
      calibrationPi: new Decimal(data.calibrationPi),
      loreStakingPi: new Decimal(data.loreStakingPi),
      chamberMaintenance: data.chamberMaintenance,
      totalScore,
      snapshotDate,
    };
  });

  // 10. Upsert snapshots (replace existing for date)
  await prisma.$transaction(
    snapshots.map((snapshot) =>
      prisma.surgeActivitySnapshot.upsert({
        where: {
          h3Index_snapshotDate: {
            h3Index: snapshot.h3Index,
            snapshotDate: snapshot.snapshotDate,
          },
        },
        update: snapshot,
        create: snapshot,
      }),
    ),
  );

  return {
    totalHexes: snapshots.length,
    totalActivityScore: snapshots.reduce((sum, s) => sum + s.totalScore, 0),
  };
}
