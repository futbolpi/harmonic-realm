import { inngest } from "@/inngest/client";
import { checkAchievementRequirement } from "@/lib/api-helpers/server/achievements";
import prisma from "@/lib/prisma";
import { getRelevantCategories } from "@/lib/utils/achievements";

export const achievementUnlockWorkflow = inngest.createFunction(
  {
    id: "game-achievement-unlock",
    retries: 3,
    concurrency: { limit: 20 },
  },
  { event: "game.achievement.check" },
  async ({ event, step }) => {
    const { userId, eventType } = event.data;

    // Step 1: Fetch relevant active achievements
    const achievements = await step.run("fetch-achievements", async () => {
      return await prisma.achievement.findMany({
        where: {
          isActive: true,
          category: { in: getRelevantCategories(eventType) },
        },
      });
    });

    // Step 2: Check and award in batch
    if (achievements.length > 0) {
      await step.run("check-and-award", async () => {
        for (const ach of achievements) {
          const isUnlocked = await checkAchievementRequirement(userId, {
            ...ach,
            createdAt: new Date(ach.createdAt),
          });
          if (isUnlocked) {
            await prisma.userAchievement.upsert({
              where: {
                userId_achievementId: { userId, achievementId: ach.id },
              },
              update: {},
              create: {
                userId,
                achievementId: ach.id,
                unlockedAt: new Date(),
              },
            });
          }
        }
      });
    }

    return { status: "Achievements checked" };
  }
);
