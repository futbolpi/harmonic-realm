import prisma from "@/lib/prisma";
import {
  calculateArtifactEffectValue,
  getArtifactSlots,
  getUpgradeCost,
} from "@/lib/utils/guild/artifact";

export async function getGuildArtifactsData(guildId: string) {
  const [guild, artifacts, templates] = await Promise.all([
    prisma.guild.findUnique({
      where: { id: guildId },
      select: {
        vaultBalance: true,
        vaultLevel: true,
        name: true,
      },
    }),
    prisma.guildArtifact.findMany({
      where: { guildId },
      include: {
        template: true,
      },
      orderBy: [{ level: "desc" }, { isEquipped: "desc" }],
    }),
    prisma.artifactTemplate.findMany({
      orderBy: [{ minVaultLevel: "asc" }, { rarity: "asc" }],
    }),
  ]);

  if (!guild) {
    return null;
  }

  const maxSlots = getArtifactSlots(guild.vaultLevel);
  const equippedCount = artifacts.filter((a) => a.isEquipped).length;

  // Calculate available templates (not yet started by guild)
  const startedTemplateIds = new Set(artifacts.map((a) => a.templateId));
  const availableTemplates = templates.filter(
    (t) => !startedTemplateIds.has(t.id) && t.minVaultLevel <= guild.vaultLevel,
  );

  return {
    guild,
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      effectValue: calculateArtifactEffectValue(
        artifact.template.baseValue,
        artifact.template.valuePerLevel,
        artifact.level,
      ),
      upgradeCost:
        artifact.level > 0 && artifact.level < 10
          ? getUpgradeCost({
              nextLevel: artifact.level + 1,
              resonanceCost: artifact.template.resonanceCost,
              shardsCost: artifact.template.echoShardsCost,
            })
          : null,
    })),
    availableTemplates,
    slots: {
      used: equippedCount,
      total: maxSlots,
      available: maxSlots - equippedCount,
    },
  };
}

export async function getArtifactCardData(guildId: string) {
  const [equipped, total, vaultLevel] = await Promise.all([
    prisma.guildArtifact.count({
      where: { guildId, isEquipped: true },
    }),
    prisma.guildArtifact.count({
      where: { guildId, level: { gt: 0 } }, // Only crafted artifacts
    }),
    prisma.guild.findUnique({
      where: { id: guildId },
      select: { vaultLevel: true },
    }),
  ]);

  const maxSlots = vaultLevel ? getArtifactSlots(vaultLevel.vaultLevel) : 1;

  return {
    equipped,
    total,
    maxSlots,
  };
}
