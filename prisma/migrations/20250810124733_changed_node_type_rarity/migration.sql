/*
  Warnings:

  - You are about to drop the column `rarity` on the `node_types` table. All the data in the column will be lost.
  - Added the required column `NodeTypeRarity` to the `node_types` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."NodeTypeRarity" AS ENUM ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary');

-- AlterTable
ALTER TABLE "public"."node_types" DROP COLUMN "rarity",
ADD COLUMN     "NodeTypeRarity" "public"."NodeTypeRarity" NOT NULL;
