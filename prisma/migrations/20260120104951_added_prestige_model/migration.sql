-- CreateEnum
CREATE TYPE "PrestigeSource" AS ENUM ('CHALLENGE_COMPLETE', 'TERRITORY_VICTORY', 'MEMBER_MILESTONE', 'VAULT_UPGRADE', 'WEEKLY_ACTIVITY', 'SPECIAL_EVENT');

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "prestigeLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "prestigeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "prestigePoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PrestigeLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "PrestigeSource" NOT NULL,
    "username" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PrestigeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrestigeLog_guildId_createdAt_idx" ON "PrestigeLog"("guildId", "createdAt");

-- CreateIndex
CREATE INDEX "PrestigeLog_guildId_source_idx" ON "PrestigeLog"("guildId", "source");

-- CreateIndex
CREATE INDEX "Guild_prestigeLevel_idx" ON "Guild"("prestigeLevel");

-- AddForeignKey
ALTER TABLE "PrestigeLog" ADD CONSTRAINT "PrestigeLog_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
