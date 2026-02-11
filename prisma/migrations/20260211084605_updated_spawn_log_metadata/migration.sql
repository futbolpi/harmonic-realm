-- AlterTable
ALTER TABLE "surge_spawn_logs" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "totalActivityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zeroActivityFallback" BOOLEAN NOT NULL DEFAULT false;
