import { achievementsData } from "../config/achievements-data";
import prisma from "../lib/prisma";

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

seedAchievements()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
