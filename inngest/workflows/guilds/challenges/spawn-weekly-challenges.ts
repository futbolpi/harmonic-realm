import { addDays } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { CHALLENGE_UNLOCKED_LEVEL } from "@/config/guilds/constants";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { generateSpawnChallengesAnnouncement } from "./utils";

/**
 * WORKFLOW: Spawn weekly challenges for all guilds with vault level 3+
 * Cron: Runs every Monday at 02:00 UTC
 * Behavior: Creates new GuildChallenge instances from WEEKLY templates for eligible guilds
 */
export const spawnWeeklyChallenges = inngest.createFunction(
  {
    id: "spawn-weekly-challenges",
    name: "Spawn Weekly Challenges (Monday 02:00 UTC)",
  },
  {
    cron: "TZ=UTC 0 2 * * 1", // Every Monday at 02:00 UTC
  },
  async ({ step, logger }) => {
    logger.info("Starting weekly challenge spawn");

    // Step 1: Fetch all WEEKLY challenge templates
    const templates = await step.run("fetch-weekly-templates", async () => {
      return await prisma.challengeTemplate.findMany({
        where: { frequency: "WEEKLY" },
        orderBy: [{ difficulty: "asc" }, { name: "asc" }],
        select: {
          id: true,
          icon: true,
          name: true,
          description: true,
          targetValue: true,
          goalType: true,
          minMembers: true,
          resonanceReward: true,
          prestigeReward: true,
          difficulty: true,
          loreText: true,
        },
      });
    });

    if (templates.length === 0) {
      logger.info("No weekly challenge templates found");
      return { spawned: 0 };
    }

    // Step 2: Calculate time window
    const startDate = new Date();
    const endDate = addDays(startDate, 7);

    logger.info(
      `Challenge window: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // Step 3: Get eligible guilds (vault level >= CHALLENGE_UNLOCKED_LEVEL)
    const eligibleGuilds = await step.run("fetch-eligible-guilds", async () => {
      return await prisma.guild.findMany({
        where: { vaultLevel: { gte: CHALLENGE_UNLOCKED_LEVEL } },
        select: { id: true, vaultLevel: true },
      });
    });

    if (eligibleGuilds.length === 0) {
      logger.info("No eligible guilds found");
      return { spawned: 0 };
    }

    logger.info(`Found ${eligibleGuilds.length} eligible guilds`);

    // Step 4: Create challenge instances for each template
    let totalCreated = 0;

    for (const template of templates) {
      await step.run(`create-challenges-for-${template.id}`, async () => {
        // Create a single challenge instance per template per week
        // Guilds opt-in individually via acceptChallenge action
        const challenge = await prisma.guildChallenge.create({
          data: {
            templateId: template.id,
            startDate,
            endDate,
            rewardResonance: template.resonanceReward,
            rewardPrestige: template.prestigeReward,
          },
          select: { id: true },
        });

        logger.info(`Created challenge from template ${template.name}`, {
          challengeId: challenge.id,
        });

        totalCreated++;
      });
    }

    try {
      await step.run("send-spawn-announcement", async () => {
        const message = generateSpawnChallengesAnnouncement(templates);
        await InngestEventDispatcher.sendHeraldAnnouncement(
          message,
          "announcement"
        );
      });
    } catch (e) {
      logger.warn("Failed to send spawn announcement", e);
    }

    logger.info(`Challenge spawn complete: ${totalCreated} challenges created`);
    return { spawned: totalCreated, eligibleGuilds: eligibleGuilds.length };
  }
);
