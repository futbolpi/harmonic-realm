/*
  Warnings:

  - You are about to drop the column `piAccessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `piUid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `piUsername` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[piId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `piId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."users_piUid_key";

-- DropIndex
DROP INDEX "public"."users_piUsername_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "piAccessToken",
DROP COLUMN "piUid",
DROP COLUMN "piUsername",
ADD COLUMN     "accessToken" TEXT NOT NULL,
ADD COLUMN     "piId" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_piId_key" ON "public"."users"("piId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_accessToken_key" ON "public"."users"("accessToken");
