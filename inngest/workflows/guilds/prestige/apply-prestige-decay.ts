import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import {
  calculatePrestigeDecay,
  getPrestigeLevelFromPoints,
  PRESTIGE_ACTIVE_MEMBER_THRESHOLD,
  PRESTIGE_DECAY_HIGH_ACTIVITY,
  PRESTIGE_DECAY_LOW_ACTIVITY,
} from "@/lib/utils/prestige";

/**
 * WORKFLOW: Apply weekly prestige decay to all guilds
 * Trigger: Cron - Every Sunday 23:00 UTC
 * Behavior: Decays prestige points based on active member count
 *   - Guilds with 10+ active members: -0.5% decay
 *   - Guilds with <10 active members: -2% decay
 */
export const applyPrestigeDecayWorkflow = inngest.createFunction(
  {
    id: "apply-prestige-decay",
    name: "Apply Weekly Prestige Decay",
  },
  { cron: "TZ=UTC 0 23 * * 0" }, // Every Sunday 23:00 UTC
  async ({ step, logger }) => {
    logger.info("Starting weekly prestige decay");

    const result = await step.run("apply-decay-to-guilds", async () => {
      const guilds = await prisma.guild.findMany({
        select: {
          prestigePoints: true,
          id: true,
          _count: { select: { members: { where: { isActive: true } } } },
        },
      });

      let processedCount = 0;
      let totalDecayAmount = 0;

      for (const guild of guilds) {
        if (guild.prestigePoints === 0) continue;

        const activeMemberCount = guild._count.members;
        const decayRate =
          activeMemberCount >= PRESTIGE_ACTIVE_MEMBER_THRESHOLD
            ? PRESTIGE_DECAY_HIGH_ACTIVITY
            : PRESTIGE_DECAY_LOW_ACTIVITY;
        const decayAmount = calculatePrestigeDecay(
          guild.prestigePoints,
          activeMemberCount,
        );

        if (decayAmount === 0) continue;

        await prisma.$transaction(async (tx) => {
          // Update guild prestige
          const newPoints = Math.max(0, guild.prestigePoints - decayAmount);
          const newLevel = getPrestigeLevelFromPoints(newPoints);

          await tx.guild.update({
            where: { id: guild.id },
            data: {
              prestigePoints: newPoints,
              prestigeLevel: Math.min(newLevel, 100),
              prestigeMultiplier: 1 + Math.min(newLevel, 100) * 0.005,
            },
            select: { prestigePoints: true },
          });

          // Log decay
          await tx.prestigeLog.create({
            data: {
              guildId: guild.id,
              amount: -decayAmount,
              source: "WEEKLY_ACTIVITY",
              metadata: {
                type: "decay",
                activeMembersCount: activeMemberCount,
                decayRate: decayRate * 100,
              },
            },
            select: { id: true },
          });
        });

        processedCount++;
        totalDecayAmount += decayAmount;
      }

      return {
        processedGuilds: processedCount,
        totalDecayAmount,
        timestamp: new Date().toISOString(),
      };
    });

    logger.info("Prestige decay completed", result);

    return {
      success: true,
      data: result,
    };
  },
);
