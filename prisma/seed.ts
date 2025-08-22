import { achievementsData } from "@/config/achievements-data";
import { nodesData, nodeTypesData } from "@/lib/seed/node-data";
import { miningSessionsData, usersData } from "@/lib/seed/user-data";
import prisma from "@/lib/prisma";

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
    for (const nt of nodeTypesData) {
      await tx.nodeType.upsert({
        where: { id: nt.id },
        update: {
          description: nt.description,
          extendedLore: nt.extendedLore,
          baseYieldPerMinute: nt.baseYieldPerMinute,
          maxMiners: nt.maxMiners,
          lockInMinutes: nt.lockInMinutes,
          rarity: nt.rarity,
          iconUrl: nt.iconUrl,
          phase: nt.phase,
        },
        create: nt,
      });
    }

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

async function seedUsersAndSessions() {
  await prisma.$transaction(async (tx) => {
    for (const user of usersData) {
      await tx.user.upsert({
        where: { piId: user.piId },
        update: {
          username: user.username,
          accessToken: user.accessToken,
          sharePoints: user.sharePoints,
          totalEarned: user.totalEarned,
          level: user.level,
          xp: user.xp,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          archivedAt: user.archivedAt,
        },
        create: user,
      });
    }

    for (const session of miningSessionsData) {
      await tx.miningSession.upsert({
        where: { id: session.id },
        update: {
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          userId: session.userId,
          nodeId: session.nodeId,
          startTime: session.startTime,
          endTime: session.endTime,
          latitudeBin: session.latitudeBin,
          longitudeBin: session.longitudeBin,
          minerSharesEarned: session.minerSharesEarned,
          status: session.status,
        },
        create: session,
      });
    }
  });
  console.log("Users and MiningSessions seeded.");
}

async function main() {
  await seedAchievements();
  if (process.env.NODE_ENV === "development") {
    await seedNodesAndTypes();
    await seedUsersAndSessions();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
