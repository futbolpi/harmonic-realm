/*
  Warnings:

  - You are about to drop the column `blockchainTxId` on the `location_lore_stakes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."location_lore_stakes" DROP COLUMN "blockchainTxId";
