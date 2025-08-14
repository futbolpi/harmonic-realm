/*
  Warnings:

  - You are about to drop the column `masteryLevel` on the `user_node_mastery` table. All the data in the column will be lost.
  - You are about to drop the column `bonusPercent` on the `user_node_upgrades` table. All the data in the column will be lost.
  - Added the required column `description` to the `node_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."node_types" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_node_mastery" DROP COLUMN "masteryLevel",
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."user_node_upgrades" DROP COLUMN "bonusPercent",
ADD COLUMN     "effectPct" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
