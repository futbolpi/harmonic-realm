-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeGenEvent" ADD VALUE 'ResonanceSurge';
ALTER TYPE "NodeGenEvent" ADD VALUE 'SurgeStabilized';

-- CreateTable
CREATE TABLE "resonance_surges" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "h3Index" TEXT NOT NULL,
    "spawnCycle" TEXT NOT NULL,
    "spawnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activityScore" INTEGER NOT NULL,
    "hexRank" INTEGER NOT NULL,
    "isStabilized" BOOLEAN NOT NULL DEFAULT false,
    "stabilizedAt" TIMESTAMP(3),
    "stabilizedBy" TEXT,
    "baseMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resonance_surges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surge_activity_snapshots" (
    "id" TEXT NOT NULL,
    "h3Index" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "miningCount" INTEGER NOT NULL DEFAULT 0,
    "tuningCount" INTEGER NOT NULL DEFAULT 0,
    "anchoringCount" INTEGER NOT NULL DEFAULT 0,
    "calibrationPi" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "loreStakingPi" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "chamberMaintenance" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "snapshotDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surge_activity_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surge_spawn_logs" (
    "id" TEXT NOT NULL,
    "spawnCycle" TEXT NOT NULL,
    "totalNodesSpawned" INTEGER NOT NULL,
    "totalHexesConsidered" INTEGER NOT NULL,
    "topHexes" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surge_spawn_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resonance_surges_nodeId_key" ON "resonance_surges"("nodeId");

-- CreateIndex
CREATE INDEX "resonance_surges_spawnCycle_expiresAt_idx" ON "resonance_surges"("spawnCycle", "expiresAt");

-- CreateIndex
CREATE INDEX "resonance_surges_h3Index_spawnCycle_idx" ON "resonance_surges"("h3Index", "spawnCycle");

-- CreateIndex
CREATE INDEX "resonance_surges_isStabilized_idx" ON "resonance_surges"("isStabilized");

-- CreateIndex
CREATE INDEX "surge_activity_snapshots_snapshotDate_totalScore_idx" ON "surge_activity_snapshots"("snapshotDate", "totalScore");

-- CreateIndex
CREATE INDEX "surge_activity_snapshots_h3Index_idx" ON "surge_activity_snapshots"("h3Index");

-- CreateIndex
CREATE UNIQUE INDEX "surge_activity_snapshots_h3Index_snapshotDate_key" ON "surge_activity_snapshots"("h3Index", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "surge_spawn_logs_spawnCycle_key" ON "surge_spawn_logs"("spawnCycle");

-- AddForeignKey
ALTER TABLE "resonance_surges" ADD CONSTRAINT "resonance_surges_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
