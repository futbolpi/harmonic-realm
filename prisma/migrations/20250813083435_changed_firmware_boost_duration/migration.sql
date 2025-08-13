/*
  Warnings:

  - You are about to drop the column `duration` on the `firmware_boosts` table. All the data in the column will be lost.
  - Added the required column `noOfSessions` to the `firmware_boosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."firmware_boosts" DROP COLUMN "duration",
ADD COLUMN     "noOfSessions" INTEGER NOT NULL;
