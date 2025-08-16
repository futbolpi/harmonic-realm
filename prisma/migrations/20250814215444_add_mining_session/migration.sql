-- CreateEnum
CREATE TYPE "public"."GamePhaseTrigger" AS ENUM ('THRESHOLD', 'TIMED');

-- AlterTable
ALTER TABLE "public"."mining_sessions" ADD COLUMN     "latitudeBin" INTEGER,
ADD COLUMN     "longitudeBin" INTEGER;

-- AlterTable
ALTER TABLE "public"."node_types" ADD COLUMN     "echoIntensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "public"."nodes" ADD COLUMN     "echoIntensity" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "public"."game_phases" (
    "id" SERIAL NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "totalNodes" INTEGER NOT NULL,
    "triggerType" "public"."GamePhaseTrigger" NOT NULL,
    "threshold" INTEGER,
    "loreNarrative" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "game_phases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_phases_phaseNumber_key" ON "public"."game_phases"("phaseNumber");
