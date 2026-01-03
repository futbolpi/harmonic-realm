-- CreateEnum
CREATE TYPE "NodeGenEvent" AS ENUM ('Awakening', 'Calibration', 'Anchoring');

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "genEvent" "NodeGenEvent" NOT NULL DEFAULT 'Awakening';
