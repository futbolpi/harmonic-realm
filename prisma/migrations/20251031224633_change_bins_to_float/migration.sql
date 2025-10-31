-- AlterTable
ALTER TABLE "public"."awakening_contributions" ALTER COLUMN "latitudeBin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "longitudeBin" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."mining_sessions" ALTER COLUMN "latitudeBin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "longitudeBin" SET DATA TYPE DOUBLE PRECISION;
