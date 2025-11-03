-- CreateTable
CREATE TABLE "public"."resonant_anchors" (
    "id" TEXT NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "locationLat" DOUBLE PRECISION NOT NULL,
    "locationLon" DOUBLE PRECISION NOT NULL,
    "nodeId" TEXT,
    "piCost" DECIMAL(20,10) NOT NULL,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "piTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resonant_anchors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resonant_anchors_phaseId_idx" ON "public"."resonant_anchors"("phaseId");

-- CreateIndex
CREATE INDEX "resonant_anchors_userId_idx" ON "public"."resonant_anchors"("userId");

-- CreateIndex
CREATE INDEX "resonant_anchors_paymentStatus_idx" ON "public"."resonant_anchors"("paymentStatus");

-- AddForeignKey
ALTER TABLE "public"."resonant_anchors" ADD CONSTRAINT "resonant_anchors_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."game_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resonant_anchors" ADD CONSTRAINT "resonant_anchors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("piId") ON DELETE RESTRICT ON UPDATE CASCADE;
