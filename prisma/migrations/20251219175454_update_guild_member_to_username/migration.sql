/*
  Warnings:

  - You are about to drop the column `leaderId` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GuildMember` table. All the data in the column will be lost.
  - You are about to drop the column `guildMemberId` on the `VaultTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[leaderUsername]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `GuildMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guildId,username]` on the table `GuildMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leaderUsername` to the `Guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `GuildMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberUsername` to the `VaultTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Guild" DROP CONSTRAINT "Guild_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuildMember" DROP CONSTRAINT "GuildMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VaultTransaction" DROP CONSTRAINT "VaultTransaction_guildMemberId_fkey";

-- DropIndex
DROP INDEX "public"."Guild_leaderId_key";

-- DropIndex
DROP INDEX "public"."GuildMember_guildId_userId_key";

-- DropIndex
DROP INDEX "public"."GuildMember_userId_key";

-- DropIndex
DROP INDEX "public"."VaultTransaction_guildMemberId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Guild" DROP COLUMN "leaderId",
ADD COLUMN     "autoKickInactive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaderUsername" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."GuildMember" DROP COLUMN "userId",
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."VaultTransaction" DROP COLUMN "guildMemberId",
ADD COLUMN     "memberUsername" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guild_leaderUsername_key" ON "public"."Guild"("leaderUsername");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_username_key" ON "public"."GuildMember"("username");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_username_key" ON "public"."GuildMember"("guildId", "username");

-- CreateIndex
CREATE INDEX "VaultTransaction_memberUsername_createdAt_idx" ON "public"."VaultTransaction"("memberUsername", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."VaultTransaction" ADD CONSTRAINT "VaultTransaction_memberUsername_fkey" FOREIGN KEY ("memberUsername") REFERENCES "public"."GuildMember"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guild" ADD CONSTRAINT "Guild_leaderUsername_fkey" FOREIGN KEY ("leaderUsername") REFERENCES "public"."users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuildMember" ADD CONSTRAINT "GuildMember_username_fkey" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
