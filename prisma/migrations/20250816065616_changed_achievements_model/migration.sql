/*
  Warnings:

  - You are about to drop the column `requirement` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `user_achievements` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AchievementRequirementType" AS ENUM ('MINING_SESSIONS', 'UNIQUE_REALMS_MINED', 'UPGRADES_PURCHASED', 'PLAYER_LEVEL', 'MASTERY_LEVEL', 'PHASE_TRIGGERED', 'GUILD_PHASE_CONTRIBUTION', 'LORE_FRAGMENTS_COLLECTED', 'BOOSTS_USED', 'MINED_NODE_RARITY', 'MAX_CONCURRENCY_MINED', 'UNIQUE_BINS_MINED', 'SHARES_ACCUMULATED', 'SESSIONS_PER_PHASE', 'MINI_TASKS_COMPLETED', 'BOOSTS_TYPES_USED', 'FRIENDS_INVITED', 'NODE_TYPES_MASTERED', 'SHARES_HELD', 'PHASES_SURVIVED', 'ECHO_INTENSITY', 'LORE_FRAGMENTS_PER_PHASE');

-- AlterTable
ALTER TABLE "public"."achievements" DROP COLUMN "requirement",
ADD COLUMN     "boostsTypesUsedRequired" INTEGER,
ADD COLUMN     "boostsUsedRequired" INTEGER,
ADD COLUMN     "echoIntensityRequired" DOUBLE PRECISION,
ADD COLUMN     "friendsInvitedRequired" INTEGER,
ADD COLUMN     "guildPhaseContributionRequired" INTEGER,
ADD COLUMN     "loreFragmentsCollectedRequired" INTEGER,
ADD COLUMN     "loreFragmentsPerPhaseRequired" TEXT,
ADD COLUMN     "masteryLevelRequired" INTEGER,
ADD COLUMN     "maxConcurrencyMinedRequired" INTEGER,
ADD COLUMN     "minedNodeRarityRequired" TEXT,
ADD COLUMN     "miniTasksCompletedRequired" INTEGER,
ADD COLUMN     "miningSessionsRequired" INTEGER,
ADD COLUMN     "nodeTypesMasteredRequired" INTEGER,
ADD COLUMN     "phaseTriggeredRequired" INTEGER,
ADD COLUMN     "phasesSurvivedRequired" INTEGER,
ADD COLUMN     "playerLevelRequired" INTEGER,
ADD COLUMN     "requirementType" "public"."AchievementRequirementType",
ADD COLUMN     "sessionsPerPhaseRequired" INTEGER,
ADD COLUMN     "sharesAccumulatedRequired" INTEGER,
ADD COLUMN     "sharesHeldRequired" INTEGER,
ADD COLUMN     "uniqueBinsMinedRequired" INTEGER,
ADD COLUMN     "uniqueRealmsRequired" INTEGER,
ADD COLUMN     "upgradesPurchasedRequired" INTEGER;

-- AlterTable
ALTER TABLE "public"."user_achievements" DROP COLUMN "progress";
