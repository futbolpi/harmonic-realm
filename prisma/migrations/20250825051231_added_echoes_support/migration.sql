-- CreateEnum
CREATE TYPE "public"."EchoResonatorStatus" AS ENUM ('EXPIRED', 'CHARGED', 'DEPLETED');

-- AlterTable
ALTER TABLE "public"."mining_sessions" ADD COLUMN     "echoTransmissionApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeReductionPercent" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."echo_transmissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chargeLevel" INTEGER NOT NULL DEFAULT 0,
    "lastChargedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "public"."EchoResonatorStatus" NOT NULL DEFAULT 'EXPIRED',
    "usedNodeIds" TEXT[],
    "totalUsageCount" INTEGER NOT NULL DEFAULT 0,
    "maxTimeReduction" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "echo_transmissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "echo_transmissions_userId_key" ON "public"."echo_transmissions"("userId");

-- AddForeignKey
ALTER TABLE "public"."echo_transmissions" ADD CONSTRAINT "echo_transmissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
