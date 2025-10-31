-- AlterTable
ALTER TABLE "public"."game_phases" ADD COLUMN     "currentProgress" DECIMAL(20,10) NOT NULL DEFAULT 0,
ADD COLUMN     "piDigitsIndex" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "requiredPiFunding" DECIMAL(20,10) NOT NULL DEFAULT 3.14;

-- CreateTable
CREATE TABLE "public"."awakening_contributions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gamePhaseId" INTEGER NOT NULL,
    "contributionTier" "public"."ContributionTier" NOT NULL,
    "latitudeBin" INTEGER NOT NULL,
    "longitudeBin" INTEGER NOT NULL,
    "piContributed" DECIMAL(20,10) NOT NULL,
    "paymentId" TEXT,
    "piTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awakening_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "awakening_contributions_gamePhaseId_idx" ON "public"."awakening_contributions"("gamePhaseId");

-- CreateIndex
CREATE INDEX "awakening_contributions_userId_idx" ON "public"."awakening_contributions"("userId");

-- CreateIndex
CREATE INDEX "awakening_contributions_latitudeBin_longitudeBin_idx" ON "public"."awakening_contributions"("latitudeBin", "longitudeBin");

-- AddForeignKey
ALTER TABLE "public"."awakening_contributions" ADD CONSTRAINT "awakening_contributions_gamePhaseId_fkey" FOREIGN KEY ("gamePhaseId") REFERENCES "public"."game_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."awakening_contributions" ADD CONSTRAINT "awakening_contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("piId") ON DELETE RESTRICT ON UPDATE CASCADE;
