/*
  Warnings:

  - You are about to drop the column `cellId` on the `node_types` table. All the data in the column will be lost.
  - You are about to drop the column `echoIntensity` on the `node_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."node_types" DROP COLUMN "cellId",
DROP COLUMN "echoIntensity";
