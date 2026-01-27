-- CreateEnum
CREATE TYPE "ArtifactRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "ArtifactEffectType" AS ENUM ('SHAREPOINT_BONUS', 'TUNING_QUALITY', 'MINING_SPEED', 'VAULT_EFFICIENCY', 'PRESTIGE_GAIN', 'TERRITORY_DEFENSE');

-- AlterTable
ALTER TABLE "GuildMember" ADD COLUMN     "echoShards" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ArtifactTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "ArtifactRarity" NOT NULL,
    "echoShardsCost" INTEGER NOT NULL,
    "resonanceCost" DOUBLE PRECISION NOT NULL,
    "effectType" "ArtifactEffectType" NOT NULL,
    "baseValue" DOUBLE PRECISION NOT NULL,
    "valuePerLevel" DOUBLE PRECISION NOT NULL,
    "minVaultLevel" INTEGER NOT NULL DEFAULT 3,
    "loreText" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'artifact',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildArtifact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "shardsBurnt" INTEGER NOT NULL DEFAULT 0,
    "contributors" JSONB,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "equippedAt" TIMESTAMP(3),

    CONSTRAINT "GuildArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactTemplate_name_key" ON "ArtifactTemplate"("name");

-- CreateIndex
CREATE INDEX "ArtifactTemplate_rarity_idx" ON "ArtifactTemplate"("rarity");

-- CreateIndex
CREATE INDEX "GuildArtifact_guildId_isEquipped_idx" ON "GuildArtifact"("guildId", "isEquipped");

-- CreateIndex
CREATE INDEX "GuildArtifact_guildId_level_idx" ON "GuildArtifact"("guildId", "level");

-- CreateIndex
CREATE INDEX "GuildArtifact_guildId_shardsBurnt_idx" ON "GuildArtifact"("guildId", "shardsBurnt");

-- CreateIndex
CREATE UNIQUE INDEX "GuildArtifact_guildId_templateId_key" ON "GuildArtifact"("guildId", "templateId");

-- AddForeignKey
ALTER TABLE "GuildArtifact" ADD CONSTRAINT "GuildArtifact_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildArtifact" ADD CONSTRAINT "GuildArtifact_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ArtifactTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
