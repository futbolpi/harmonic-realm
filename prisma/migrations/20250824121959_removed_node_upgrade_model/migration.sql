/*
  Warnings:

  - You are about to drop the `user_node_upgrades` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_node_upgrades" DROP CONSTRAINT "user_node_upgrades_nodeTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_node_upgrades" DROP CONSTRAINT "user_node_upgrades_userId_fkey";

-- DropTable
DROP TABLE "public"."user_node_upgrades";
