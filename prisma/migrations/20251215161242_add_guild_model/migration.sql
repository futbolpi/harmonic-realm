-- CreateEnum
CREATE TYPE "public"."VaultTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'REWARD', 'UPGRADE', 'DISTRIBUTION');

-- CreateEnum
CREATE TYPE "public"."GuildRole" AS ENUM ('LEADER', 'OFFICER', 'MEMBER');

-- AlterEnum
ALTER TYPE "public"."PaymentType" ADD VALUE 'GUILD_CREATION';

-- CreateTable
CREATE TABLE "public"."VaultTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildMemberId" TEXT NOT NULL,
    "type" "public"."VaultTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "VaultTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VaultUpgrade" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "resonanceCost" DOUBLE PRECISION NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "prestigeBonus" DOUBLE PRECISION NOT NULL,
    "artifactSlots" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "VaultUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guild" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emblem" TEXT NOT NULL DEFAULT 'default',
    "tag" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "vaultBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalContributed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vaultLevel" INTEGER NOT NULL DEFAULT 1,
    "totalSharePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNodesMined" INTEGER NOT NULL DEFAULT 0,
    "totalTunesPerfect" INTEGER NOT NULL DEFAULT 0,
    "weeklyActivity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "minRF" INTEGER NOT NULL DEFAULT 0,
    "paymentId" TEXT,
    "piTransactionId" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildMember" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."GuildRole" NOT NULL DEFAULT 'MEMBER',
    "vaultContribution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklySharePoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "challengeCompletions" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultTransaction_guildMemberId_createdAt_idx" ON "public"."VaultTransaction"("guildMemberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VaultUpgrade_level_key" ON "public"."VaultUpgrade"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "public"."Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_tag_key" ON "public"."Guild"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_leaderId_key" ON "public"."Guild"("leaderId");

-- CreateIndex
CREATE INDEX "Guild_weeklyActivity_idx" ON "public"."Guild"("weeklyActivity");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_userId_key" ON "public"."GuildMember"("userId");

-- CreateIndex
CREATE INDEX "GuildMember_guildId_weeklySharePoints_idx" ON "public"."GuildMember"("guildId", "weeklySharePoints");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_userId_key" ON "public"."GuildMember"("guildId", "userId");

-- AddForeignKey
ALTER TABLE "public"."VaultTransaction" ADD CONSTRAINT "VaultTransaction_guildMemberId_fkey" FOREIGN KEY ("guildMemberId") REFERENCES "public"."GuildMember"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guild" ADD CONSTRAINT "Guild_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
