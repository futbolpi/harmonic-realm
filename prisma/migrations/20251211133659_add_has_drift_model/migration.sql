-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "driftCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastDriftAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."node_drifts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "originalLatitude" DOUBLE PRECISION NOT NULL,
    "originalLongitude" DOUBLE PRECISION NOT NULL,
    "newLatitude" DOUBLE PRECISION NOT NULL,
    "newLongitude" DOUBLE PRECISION NOT NULL,
    "sharePointsCost" DOUBLE PRECISION NOT NULL,
    "nodeRarity" "public"."NodeTypeRarity" NOT NULL,
    "driftRadius" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "originalDistance" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_drifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "node_drifts_userId_timestamp_idx" ON "public"."node_drifts"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "node_drifts_nodeId_idx" ON "public"."node_drifts"("nodeId");

-- AddForeignKey
ALTER TABLE "public"."node_drifts" ADD CONSTRAINT "node_drifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."node_drifts" ADD CONSTRAINT "node_drifts_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
