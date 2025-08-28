/*
  Warnings:

  - The values [MINING_REWARD,ACHIEVEMENT_BONUS,UPGRADE_PURCHASE,BOOST_PURCHASE,ADJUSTMENT] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentType_new" AS ENUM ('LOCATION_LORE', 'AWAKENING', 'SHARE_REDEMPTION');
ALTER TYPE "public"."PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "public"."PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "public"."PaymentType_old";
COMMIT;
