/*
  Warnings:

  - The values [ABANDONED,EXPIRED,GPS_PENDING,LOCKED_IN] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `duration` on the `mining_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `gpsVerified` on the `mining_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `lockInCompleted` on the `mining_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `lockInCompletedAt` on the `mining_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `NodeTypeRarity` on the `node_types` table. All the data in the column will be lost.
  - Added the required column `rarity` to the `node_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SessionStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."mining_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."mining_sessions" ALTER COLUMN "status" TYPE "public"."SessionStatus_new" USING ("status"::text::"public"."SessionStatus_new");
ALTER TYPE "public"."SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "public"."SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "public"."SessionStatus_old";
ALTER TABLE "public"."mining_sessions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."mining_sessions" DROP COLUMN "duration",
DROP COLUMN "gpsVerified",
DROP COLUMN "lockInCompleted",
DROP COLUMN "lockInCompletedAt";

-- AlterTable
ALTER TABLE "public"."node_types" DROP COLUMN "NodeTypeRarity",
ADD COLUMN     "rarity" "public"."NodeTypeRarity" NOT NULL;
