-- AlterTable
ALTER TABLE "public"."resonant_anchors" ADD COLUMN     "discountLevels" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralPointsBurned" INTEGER NOT NULL DEFAULT 0;
