import { achievementsData } from "../config/achievements-data";
import prisma from "../lib/prisma";
import { nodesData, nodeTypesData } from "../lib/seed/node-data";

async function seedAchievements() {
  for (const ach of achievementsData) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach,
    });
  }
  console.log("Achievements seeded.");
}

async function seedNodesAndTypes() {
  await prisma.$transaction(async (tx) => {
    // Seed NodeTypes
    for (const nt of nodeTypesData) {
      await tx.nodeType.upsert({
        where: { id: nt.id },
        update: {
          cellId: nt.cellId,
          description: nt.description,
          extendedLore: nt.extendedLore,
          baseYieldPerMinute: nt.baseYieldPerMinute,
          maxMiners: nt.maxMiners,
          lockInMinutes: nt.lockInMinutes,
          rarity: nt.rarity,
          iconUrl: nt.iconUrl,
          phase: nt.phase,
          echoIntensity: nt.echoIntensity,
        },
        create: nt,
      });
    }

    // Seed Nodes (after types to ensure typeId exists)
    for (const node of nodesData) {
      await tx.node.upsert({
        where: { id: node.id },
        update: {
          name: node.name,
          typeId: node.typeId,
          latitude: node.latitude,
          longitude: node.longitude,
          openForMining: node.openForMining,
          sponsor: node.sponsor,
          lore: node.lore,
          phase: node.phase,
          echoIntensity: node.echoIntensity,
        },
        create: node,
      });
    }
  });
  console.log("Nodes and NodeTypes seeded.");
}

async function main() {
  await seedAchievements();
  await seedNodesAndTypes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
