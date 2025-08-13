/*
  Warnings:

  - A unique constraint covering the columns `[userId,nodeId]` on the table `mining_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "mining_sessions_userId_nodeId_key" ON "public"."mining_sessions"("userId", "nodeId");
