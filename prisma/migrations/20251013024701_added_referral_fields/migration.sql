-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "noOfReferrals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referrer" TEXT;
