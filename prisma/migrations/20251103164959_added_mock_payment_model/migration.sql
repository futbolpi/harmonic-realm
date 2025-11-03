-- CreateEnum
CREATE TYPE "public"."MockPaymentType" AS ENUM ('MAINNET_WALLET');

-- AlterEnum
ALTER TYPE "public"."PaymentType" ADD VALUE 'MOCK_PAYMENT';

-- CreateTable
CREATE TABLE "public"."mock_payments" (
    "id" TEXT NOT NULL,
    "userPiId" TEXT NOT NULL,
    "type" "public"."MockPaymentType" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(65,30) NOT NULL,
    "piTxId" TEXT,
    "piPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_payments_pkey" PRIMARY KEY ("id")
);
