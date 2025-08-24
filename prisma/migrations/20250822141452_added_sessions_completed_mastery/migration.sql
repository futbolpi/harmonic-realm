/*
  Warnings:

  - You are about to drop the column `totalSessions` on the `user_node_mastery` table. All the data in the column will be lost.
  - You are about to drop the column `totalTimeSpent` on the `user_node_mastery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user_node_mastery" DROP COLUMN "totalSessions",
DROP COLUMN "totalTimeSpent",
ADD COLUMN     "sessionsCompleted" INTEGER NOT NULL DEFAULT 0;
