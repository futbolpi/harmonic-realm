/*
  Warnings:

  - The primary key for the `node_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cellId` to the `node_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."GamePhaseTrigger" ADD VALUE 'GENESIS';
ALTER TYPE "public"."GamePhaseTrigger" ADD VALUE 'SPONSORED';

-- DropForeignKey
ALTER TABLE "public"."nodes" DROP CONSTRAINT "nodes_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_node_mastery" DROP CONSTRAINT "user_node_mastery_nodeTypeId_fkey";

-- AlterTable
ALTER TABLE "public"."node_types" DROP CONSTRAINT "node_types_pkey",
ADD COLUMN     "cellId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "node_types_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "node_types_id_seq";

-- AlterTable
ALTER TABLE "public"."nodes" ALTER COLUMN "typeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."user_node_mastery" ALTER COLUMN "nodeTypeId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."nodes" ADD CONSTRAINT "nodes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."node_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_node_mastery" ADD CONSTRAINT "user_node_mastery_nodeTypeId_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "public"."node_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
