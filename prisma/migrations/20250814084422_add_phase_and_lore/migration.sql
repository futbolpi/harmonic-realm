-- AlterTable
ALTER TABLE "public"."node_types" ADD COLUMN     "extendedLore" TEXT,
ADD COLUMN     "phase" INTEGER;

-- AlterTable
ALTER TABLE "public"."nodes" ADD COLUMN     "phase" INTEGER;

-- CreateIndex
CREATE INDEX "node_types_rarity_phase_idx" ON "public"."node_types"("rarity", "phase");

-- CreateIndex
CREATE INDEX "nodes_phase_idx" ON "public"."nodes"("phase");
