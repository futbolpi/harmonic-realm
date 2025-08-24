-- AlterTable
ALTER TABLE "public"."user_node_upgrades" ALTER COLUMN "nodeTypeId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."user_node_upgrades" ADD CONSTRAINT "user_node_upgrades_nodeTypeId_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "public"."node_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
