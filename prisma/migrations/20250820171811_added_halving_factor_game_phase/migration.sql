/*
  Warnings:

  - Added the required column `halvingFactor` to the `game_phases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."game_phases" ADD COLUMN     "halvingFactor" DOUBLE PRECISION NOT NULL;
