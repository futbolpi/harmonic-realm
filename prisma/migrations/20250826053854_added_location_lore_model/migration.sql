/*
  Warnings:

  - The `status` column on the `share_redemptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `pi_payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."LoreGenerationStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ContributionTier" AS ENUM ('ECHO_SUPPORTER', 'RESONANCE_PATRON', 'LATTICE_ARCHITECT', 'COSMIC_FOUNDER');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING');

-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "public"."pi_payments" DROP CONSTRAINT "pi_payments_userId_fkey";

-- AlterTable
ALTER TABLE "public"."share_redemptions" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "public"."pi_payments";

-- DropEnum
DROP TYPE "public"."RedemptionStatus";

-- CreateTable
CREATE TABLE "public"."location_lore" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "district" TEXT,
    "address" TEXT,
    "postcode" TEXT,
    "reverseGeoData" JSONB,
    "basicHistory" TEXT,
    "culturalSignificance" TEXT,
    "mysticInterpretation" TEXT,
    "epicNarrative" TEXT,
    "legendaryTale" TEXT,
    "cosmeticThemes" JSONB,
    "audioThemes" JSONB,
    "currentLevel" INTEGER NOT NULL DEFAULT 0,
    "totalPiStaked" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "generationStatus" "public"."LoreGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "generationError" TEXT,
    "lastGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_lore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location_lore_stakes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "piAmount" DECIMAL(10,4) NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "paymentId" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "contributionTier" "public"."ContributionTier",
    "piTransactionId" TEXT,
    "blockchainTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_lore_stakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lore_generation_jobs" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "targetLevel" INTEGER NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "inngestEventId" TEXT,
    "geoData" JSONB,
    "aiPrompt" TEXT,
    "aiResponse" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lore_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_lore_nodeId_key" ON "public"."location_lore"("nodeId");

-- CreateIndex
CREATE INDEX "lore_level_idx" ON "public"."location_lore"("currentLevel");

-- CreateIndex
CREATE INDEX "pi_staked_idx" ON "public"."location_lore"("totalPiStaked");

-- CreateIndex
CREATE INDEX "generation_status_idx" ON "public"."location_lore"("generationStatus");

-- CreateIndex
CREATE INDEX "stake_user_idx" ON "public"."location_lore_stakes"("userId");

-- CreateIndex
CREATE INDEX "stake_node_idx" ON "public"."location_lore_stakes"("nodeId");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "public"."location_lore_stakes"("paymentStatus");

-- CreateIndex
CREATE INDEX "job_status_idx" ON "public"."lore_generation_jobs"("status");

-- CreateIndex
CREATE INDEX "job_node_idx" ON "public"."lore_generation_jobs"("nodeId");

-- CreateIndex
CREATE INDEX "mastery_level_idx" ON "public"."user_node_mastery"("level");

-- AddForeignKey
ALTER TABLE "public"."location_lore" ADD CONSTRAINT "location_lore_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_lore_stakes" ADD CONSTRAINT "location_lore_stakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."location_lore_stakes" ADD CONSTRAINT "location_lore_stakes_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."location_lore"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
