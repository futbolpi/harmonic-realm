/*
  Warnings:

  - The values [UPGRADES_PURCHASED] on the enum `AchievementRequirementType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `upgradesPurchasedRequired` on the `achievements` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AchievementRequirementType_new" AS ENUM ('MINING_SESSIONS', 'UNIQUE_REALMS_MINED', 'PLAYER_LEVEL', 'MASTERY_LEVEL', 'PHASE_TRIGGERED', 'GUILD_PHASE_CONTRIBUTION', 'LORE_FRAGMENTS_COLLECTED', 'BOOSTS_USED', 'MINED_NODE_RARITY', 'MAX_CONCURRENCY_MINED', 'UNIQUE_BINS_MINED', 'SHARES_ACCUMULATED', 'SESSIONS_PER_PHASE', 'MINI_TASKS_COMPLETED', 'BOOSTS_TYPES_USED', 'FRIENDS_INVITED', 'NODE_TYPES_MASTERED', 'SHARES_HELD', 'PHASES_SURVIVED', 'ECHO_INTENSITY', 'LORE_FRAGMENTS_PER_PHASE');
ALTER TABLE "public"."achievements" ALTER COLUMN "requirementType" TYPE "public"."AchievementRequirementType_new" USING ("requirementType"::text::"public"."AchievementRequirementType_new");
ALTER TYPE "public"."AchievementRequirementType" RENAME TO "AchievementRequirementType_old";
ALTER TYPE "public"."AchievementRequirementType_new" RENAME TO "AchievementRequirementType";
DROP TYPE "public"."AchievementRequirementType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."achievements" DROP COLUMN "upgradesPurchasedRequired";
