/*
  Warnings:

  - You are about to drop the column `experience` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "experience",
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;
