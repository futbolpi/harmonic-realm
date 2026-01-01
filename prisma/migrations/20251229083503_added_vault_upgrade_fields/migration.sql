/*
  Warnings:

  - Added the required column `challengesUnlocked` to the `VaultUpgrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exclusiveCosmetics` to the `VaultUpgrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharePointsBonus` to the `VaultUpgrade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `territoryUnlocked` to the `VaultUpgrade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."VaultUpgrade" ADD COLUMN     "challengesUnlocked" BOOLEAN NOT NULL,
ADD COLUMN     "exclusiveCosmetics" BOOLEAN NOT NULL,
ADD COLUMN     "sharePointsBonus" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "territoryUnlocked" BOOLEAN NOT NULL;
