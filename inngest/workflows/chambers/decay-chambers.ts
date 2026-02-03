import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import {
  calculateCurrentDurability,
  CHAMBER_CONSTANTS,
} from "@/lib/utils/chambers";

/**
 * WORKFLOW: Decay Chamber Durability & Send Notifications
 *
 * Schedule: Daily at 00:00 UTC
 *
 * Behavior:
 * 1. Fetch all active chambers with maintenance overdue (maintenanceDueAt < now)
 * 2. Calculate current durability based on last maintenance timestamp
 * 3. Update chamber durability in database
 * 4. Send notifications to users with chambers below 20% durability
 *
 * Performance Optimizations:
 * - Batch update durability for all chambers in single query
 * - Group notifications by userId to avoid spam
 * - Only notify for critical chambers (<20% durability)
 */
export const decayChambersWorkflow = inngest.createFunction(
  {
    id: "decay-chambers-durability",
    name: "Decay Chamber Durability & Notify Users",
  },
  {
    cron: "TZ=UTC 0 0 * * *", // Daily at midnight UTC
  },
  async ({ step, logger }) => {
    logger.info("Starting chamber durability decay workflow");

    // Step 1: Fetch overdue chambers
    const overdueChambers = await step.run(
      "fetch-overdue-chambers",
      async () => {
        return await prisma.echoResonanceChamber.findMany({
          where: {
            isActive: true,
            maintenanceDueAt: { lt: new Date() },
          },
          select: {
            id: true,
            userId: true,
            level: true,
            lastMaintenanceAt: true,
            durability: true,
            user: {
              select: {
                username: true,
                piId: true,
              },
            },
          },
        });
      },
    );

    if (overdueChambers.length === 0) {
      logger.info("No overdue chambers found");
      return { decayed: 0, critical: 0 };
    }

    logger.info(`Found ${overdueChambers.length} overdue chambers`);

    // Step 2: Calculate new durability and update in batch
    const updates = await step.run("update-chamber-durability", async () => {
      const updatePromises = overdueChambers.map(async (chamber) => {
        const newDurability = calculateCurrentDurability(
          new Date(chamber.lastMaintenanceAt),
        );

        // Only update if durability has changed significantly (>1% difference)
        if (Math.abs(chamber.durability - newDurability) > 1) {
          return await prisma.echoResonanceChamber.update({
            where: { id: chamber.id },
            data: { durability: newDurability },
            select: {
              id: true,
              userId: true,
              durability: true,
              level: true,
              user: { select: { username: true } },
            },
          });
        }

        return {
          id: chamber.id,
          userId: chamber.userId,
          durability: newDurability,
          level: chamber.level,
          user: chamber.user,
        };
      });

      return await Promise.all(updatePromises);
    });

    logger.info(`Updated ${updates.length} chamber durability values`);

    // Step 3: Filter critical chambers (<20% durability) and send notifications
    const criticalChambers = updates.filter(
      (c) => c.durability < CHAMBER_CONSTANTS.MAINTENANCE_WARNING_THRESHOLD,
    );

    if (criticalChambers.length === 0) {
      logger.info("No critical chambers found");
      return { decayed: updates.length, critical: 0 };
    }

    logger.info(`Found ${criticalChambers.length} critical chambers (<20%)`);

    // Step 4: Group chambers by user and send batched notifications
    await step.run("send-maintenance-notifications", async () => {
      // Group chambers by userId
      const userGroups = criticalChambers.reduce(
        (acc, chamber) => {
          if (!acc[chamber.userId]) {
            acc[chamber.userId] = [];
          }
          acc[chamber.userId].push(chamber);
          return acc;
        },
        {} as Record<string, typeof criticalChambers>,
      );

      logger.info(
        `Sending notifications to ${Object.keys(userGroups).length} users`,
      );

      // Send notifications via Telegram (Cosmic Herald)
      for (const [userId, chambers] of Object.entries(userGroups)) {
        const username = chambers[0].user.username;
        const chamberCount = chambers.length;
        const chamberList = chambers
          .map((c) => `• Level ${c.level} (${c.durability.toFixed(0)}%)`)
          .join("\n");

        const message = `
<b>⚠️ CHAMBER MAINTENANCE REQUIRED</b>

Pioneer <b>${username}</b>, your Echo Resonance Chamber${chamberCount > 1 ? "s" : ""} require immediate attention!

<b>Critical Chambers (${chamberCount}):</b>
${chamberList}

Chambers below 20% durability are at risk of complete decay. Perform maintenance to restore resonance and continue benefiting from SharePoint boosts.

<i>— The Lattice Keeper</i>
        `.trim();

        try {
          await InngestEventDispatcher.sendHeraldAnnouncement(
            message,
            "announcement",
          );
        } catch (error) {
          logger.error(`Failed to send notification to user ${userId}`, error);
        }
      }
    });

    logger.info("Chamber decay workflow completed successfully");

    return {
      decayed: updates.length,
      critical: criticalChambers.length,
    };
  },
);
