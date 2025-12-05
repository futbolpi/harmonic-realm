-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "dailyStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastTunedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."TuningSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "sharesEarned" DOUBLE PRECISION NOT NULL,
    "milestoneReached" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TuningSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TuningSession_userId_timestamp_idx" ON "public"."TuningSession"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "TuningSession_nodeId_idx" ON "public"."TuningSession"("nodeId");

-- AddForeignKey
ALTER TABLE "public"."TuningSession" ADD CONSTRAINT "TuningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TuningSession" ADD CONSTRAINT "TuningSession_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
