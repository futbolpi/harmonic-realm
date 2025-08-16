import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

// New workflow: Triggered after phase completion (from genesis or nextPhase).
// Announces the new phase via a lore-themed announcement workflow.
// Awards a special achievement to the triggering user (if userId provided in event data).
// Follows Inngest best practices: Steps for idempotency, concurrency limit 1 for achievement award to avoid duplicates.
export const phaseCompletedWorkflow = inngest.createFunction(
  {
    id: "game-phase-completed",
    retries: 2,
    concurrency: { limit: 1 }, // Prevent race on achievement award
  },
  { event: "game.phase.completed" },
  async ({ event, step }) => {
    const { phase, nodesSpawned, triggeringUserId } = event.data; // Assume triggeringUserId sent from completeMiningSession

    // Step 1: Award achievement to triggering user (if provided)
    if (triggeringUserId) {
      await step.run("award-phase-trigger-achievement", async () => {
        const achievement = await prisma.achievement.findUnique({
          where: { name: "Phase Awakener" }, // Assuming this achievement exists from seed
        });
        if (!achievement)
          throw new Error("Phase Awakener achievement not found");

        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: triggeringUserId,
              achievementId: achievement.id,
            },
          },
          update: { unlockedAt: new Date() },
          create: {
            userId: triggeringUserId,
            achievementId: achievement.id,
            unlockedAt: new Date(),
          },
        });
      });
    }

    // Step 2: Invoke announcement workflow
    await inngest.send({
      name: "cosmic-herald-announcement",
      data: {
        messageType: "announcement",
        content: `The Lattice awakens to Phase ${phase}! ${nodesSpawned} new nodes pulse with cosmic energy. Pioneers, harmonize and claim your destiny!`,
        phase,
      },
    });

    return { status: "Phase completion processed", phase };
  }
);
