/*
  Warnings:

  - The values [AWAKENING] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaymentType_new" AS ENUM ('LOCATION_LORE', 'RESONANCE_ANCHOR', 'SHARE_REDEMPTION', 'LATTICE_CALIBRATION');
ALTER TYPE "public"."PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "public"."PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "public"."PaymentType_old";
COMMIT;
