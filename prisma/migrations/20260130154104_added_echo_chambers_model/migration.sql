-- CreateTable
CREATE TABLE "echo_resonance_chambers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "h3Index" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalResonanceInvested" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durability" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "lastMaintenanceAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maintenanceDueAt" TIMESTAMP(3) NOT NULL,
    "cosmeticTheme" TEXT DEFAULT 'default',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "echo_resonance_chambers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamber_maintenance_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamberId" TEXT NOT NULL,
    "resonanceSpent" DOUBLE PRECISION NOT NULL,
    "durabilityRestored" DOUBLE PRECISION NOT NULL,
    "durabilityBefore" DOUBLE PRECISION NOT NULL,
    "durabilityAfter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "chamber_maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamber_upgrade_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamberId" TEXT NOT NULL,
    "fromLevel" INTEGER NOT NULL,
    "toLevel" INTEGER NOT NULL,
    "resonanceCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "chamber_upgrade_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "echo_resonance_chambers_userId_isActive_idx" ON "echo_resonance_chambers"("userId", "isActive");

-- CreateIndex
CREATE INDEX "echo_resonance_chambers_h3Index_isActive_idx" ON "echo_resonance_chambers"("h3Index", "isActive");

-- CreateIndex
CREATE INDEX "echo_resonance_chambers_maintenanceDueAt_idx" ON "echo_resonance_chambers"("maintenanceDueAt");

-- CreateIndex
CREATE INDEX "echo_resonance_chambers_latitude_longitude_idx" ON "echo_resonance_chambers"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "chamber_maintenance_logs_chamberId_createdAt_idx" ON "chamber_maintenance_logs"("chamberId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "chamber_upgrade_logs_chamberId_createdAt_idx" ON "chamber_upgrade_logs"("chamberId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "echo_resonance_chambers" ADD CONSTRAINT "echo_resonance_chambers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamber_maintenance_logs" ADD CONSTRAINT "chamber_maintenance_logs_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "echo_resonance_chambers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamber_upgrade_logs" ADD CONSTRAINT "chamber_upgrade_logs_chamberId_fkey" FOREIGN KEY ("chamberId") REFERENCES "echo_resonance_chambers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
