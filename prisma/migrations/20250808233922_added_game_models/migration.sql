-- CreateEnum
CREATE TYPE "public"."AchievementCategory" AS ENUM ('EXPLORATION', 'MINING', 'SOCIAL', 'PROGRESSION', 'SPECIAL', 'MASTERY');

-- CreateEnum
CREATE TYPE "public"."AchievementRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "public"."BoostType" AS ENUM ('YIELD_MULTIPLIER', 'TIME_REDUCTION', 'ACCURACY_BOOST', 'EXPERIENCE_BOOST');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('MINING_REWARD', 'ACHIEVEMENT_BONUS', 'UPGRADE_PURCHASE', 'SHARE_REDEMPTION', 'BOOST_PURCHASE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RedemptionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED', 'EXPIRED', 'GPS_PENDING', 'LOCKED_IN');

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" "public"."AchievementCategory" NOT NULL,
    "requirement" JSONB NOT NULL,
    "reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rarity" "public"."AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_achievements" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" JSONB,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."firmware_boosts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "boostType" "public"."BoostType" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "firmware_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."node_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "baseYieldPerMinute" DOUBLE PRECISION NOT NULL,
    "maxMiners" INTEGER NOT NULL,
    "lockInMinutes" INTEGER NOT NULL,
    "rarity" INTEGER NOT NULL,
    "iconUrl" TEXT,

    CONSTRAINT "node_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nodes" (
    "id" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "openForMining" BOOLEAN NOT NULL DEFAULT true,
    "sponsor" TEXT,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_node_upgrades" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "nodeTypeId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "bonusPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "user_node_upgrades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_node_mastery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeTypeId" INTEGER NOT NULL,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "bonusPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "user_node_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pi_payments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "public"."PaymentType" NOT NULL,
    "description" TEXT,
    "piTxId" TEXT,
    "piPaymentId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,

    CONSTRAINT "pi_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."share_redemptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sharesRedeemed" DOUBLE PRECISION NOT NULL,
    "piReceived" DOUBLE PRECISION NOT NULL,
    "redemptionRate" DOUBLE PRECISION NOT NULL,
    "status" "public"."RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "piTxId" TEXT,
    "piPaymentId" TEXT,

    CONSTRAINT "share_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mining_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "minerSharesEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "gpsVerified" BOOLEAN NOT NULL DEFAULT false,
    "lockInCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lockInCompletedAt" TIMESTAMP(3),

    CONSTRAINT "mining_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "public"."achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "public"."user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_node_upgrades_userId_nodeTypeId_key" ON "public"."user_node_upgrades"("userId", "nodeTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_node_mastery_userId_nodeTypeId_key" ON "public"."user_node_mastery"("userId", "nodeTypeId");

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."firmware_boosts" ADD CONSTRAINT "firmware_boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nodes" ADD CONSTRAINT "nodes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."node_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_node_upgrades" ADD CONSTRAINT "user_node_upgrades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_node_mastery" ADD CONSTRAINT "user_node_mastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_node_mastery" ADD CONSTRAINT "user_node_mastery_nodeTypeId_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "public"."node_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pi_payments" ADD CONSTRAINT "pi_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."share_redemptions" ADD CONSTRAINT "share_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mining_sessions" ADD CONSTRAINT "mining_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mining_sessions" ADD CONSTRAINT "mining_sessions_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
