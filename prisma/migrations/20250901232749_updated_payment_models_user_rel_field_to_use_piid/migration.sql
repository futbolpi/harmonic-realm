-- DropForeignKey
ALTER TABLE "public"."location_lore_stakes" DROP CONSTRAINT "location_lore_stakes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."share_redemptions" DROP CONSTRAINT "share_redemptions_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."location_lore_stakes" ADD CONSTRAINT "location_lore_stakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("piId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."share_redemptions" ADD CONSTRAINT "share_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("piId") ON DELETE CASCADE ON UPDATE CASCADE;
