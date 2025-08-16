/*
  Warnings:

  - Added the required column `lore` to the `nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `nodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."nodes" ADD COLUMN     "lore" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
