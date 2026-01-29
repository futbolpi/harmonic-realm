import { endOfWeek, startOfWeek, subWeeks } from "date-fns";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { InngestEventDispatcher } from "@/inngest/dispatcher";

/**
 * WORKFLOW: Distribute Weekly Guild Rewards
 * - Runs every Monday 00:00 UTC
 * - For each guild, computes last week's deposits (Mon-Sun)
 * - Builds a distribution pool = 20% of deposits
 * - Skips guilds where pool < 10 or total member weekly activity <= 0
 * - Distributes pool proportionally by members' weeklySharePoints
 * - Creates a `DISTRIBUTION` VaultTransaction per member
 * - Increments each user's `sharePoints`
 * - Decrements guild vault by pool and increments guild.totalSharePoints
 * - Resets all guild members' weeklySharePoints to 0
 * - Resets all guilds' weeklyActivity to 0
 */
export const distributeWeeklyRewards = inngest.createFunction(
  {
    id: "distribute-weekly-rewards",
    name: "Distribute Weekly Guild Rewards",
  },
  {
    // Run every Monday 00:00 UTC
    cron: "TZ=UTC 0 0 * * 1",
  },
  async ({ step, logger }) => {
    logger.info("Starting weekly guild rewards distribution");

    // Determine previous week window (Monday - Sunday)
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });

    logger.info("Computed previous week window", {
      prevWeekStart: prevWeekStart.toISOString(),
      prevWeekEnd: prevWeekEnd.toISOString(),
    });

    // Fetch deposits for that window and aggregate by guild via guildMember relation
    const deposits = await step.run("fetch-deposits", async () => {
      return await prisma.vaultTransaction.findMany({
        where: {
          type: { in: ["DEPOSIT", "REWARD"] },
          archivedAt: null,
          createdAt: { gte: prevWeekStart, lte: prevWeekEnd },
        },
        select: {
          amount: true,
          guildMember: { select: { guildId: true } },
        },
      });
    });

    if (!deposits || deposits.length === 0) {
      logger.info("No deposits found for previous week, nothing to distribute");
      return { message: "No guild deposits last week" };
    }

    // Group deposits by guildId
    const sumsByGuild = new Map<string, number>();
    for (const d of deposits) {
      const gId = d.guildMember?.guildId;
      if (!gId) continue;
      sumsByGuild.set(gId, (sumsByGuild.get(gId) ?? 0) + d.amount);
    }

    // Process each guild in a separate step so failures are isolated & retryable
    for (const [guildId, totalDeposited] of sumsByGuild.entries()) {
      await step.run(`process-guild-${guildId}`, async () => {
        try {
          if (totalDeposited <= 0) {
            logger.info("Skipping guild with zero deposits", { guildId });
            return { guildId, skipped: true, reason: "zero-deposits" };
          }

          const pool = totalDeposited * 0.2; // 20% distribution

          if (pool < 10) {
            logger.info("Skipping guild, pool below threshold", {
              guildId,
              pool,
            });
            return {
              guildId,
              skipped: true,
              reason: "pool-below-threshold",
              pool,
            };
          }

          // Load guild and members
          const guild = await prisma.guild.findUnique({
            where: { id: guildId },
            select: { id: true, name: true, vaultBalance: true },
          });

          if (!guild) {
            logger.warn("Guild not found, skipping", { guildId });
            return { guildId, skipped: true, reason: "guild-not-found" };
          }

          if ((guild.vaultBalance ?? 0) < pool) {
            logger.warn("Insufficient guild vault balance, skipping", {
              guildId,
              vaultBalance: guild.vaultBalance,
              pool,
            });
            return { guildId, skipped: true, reason: "insufficient-balance" };
          }

          const members = await prisma.guildMember.findMany({
            where: { guildId, isActive: true, weeklySharePoints: { gt: 0 } },
            select: { username: true, weeklySharePoints: true },
          });

          const totalActivity = members.reduce(
            (s, m) => s + (m.weeklySharePoints ?? 0),
            0,
          );

          if (totalActivity <= 0) {
            logger.info("Skipping guild, no member activity last week", {
              guildId,
            });
            return { guildId, skipped: true, reason: "no-activity" };
          }

          // Build distributions (round to 2 decimals, give remainder to last member)
          const distributions: { username: string; amount: number }[] = [];
          let allocated = 0;

          // Sort members deterministically so last receives remainder consistently
          const sortedMembers = members
            .slice()
            .sort((a, b) => a.username.localeCompare(b.username));

          for (let i = 0; i < sortedMembers.length; i++) {
            const m = sortedMembers[i];
            const rawShare =
              ((m.weeklySharePoints ?? 0) / totalActivity) * pool;
            const rounded = Math.round((rawShare + Number.EPSILON) * 100) / 100;

            // Last member gets remainder to ensure exact allocation
            if (i === sortedMembers.length - 1) {
              const remainder = Math.round((pool - allocated) * 100) / 100;
              distributions.push({ username: m.username, amount: remainder });
              allocated = Math.round((allocated + remainder) * 100) / 100;
            } else {
              distributions.push({ username: m.username, amount: rounded });
              allocated = Math.round((allocated + rounded) * 100) / 100;
            }
          }

          // Final safety check
          if (Math.abs(allocated - Math.round(pool * 100) / 100) > 0.001) {
            logger.warn("Allocated amount does not equal pool after rounding", {
              guildId,
              pool,
              allocated,
            });
          }

          // Perform DB transaction: create vault transactions (batched), update users, update guild balance
          await prisma.$transaction(async (tx) => {
            let runningBalance = guild.vaultBalance ?? 0;

            // Precompute transactions with balanceBefore/After
            const txData = distributions.map((d) => {
              const balanceBefore = runningBalance;
              const balanceAfter =
                Math.round((runningBalance - d.amount) * 100) / 100;
              runningBalance = balanceAfter;

              return {
                memberUsername: d.username,
                type: "DISTRIBUTION",
                amount: d.amount,
                balanceBefore,
                balanceAfter,
                reason: `Weekly distribution ${prevWeekStart.toISOString()} -> ${prevWeekEnd.toISOString()}`,
                metadata: {
                  weekStart: prevWeekStart.toISOString(),
                  weekEnd: prevWeekEnd.toISOString(),
                },
              } as const;
            });

            // Batch insert transactions to reduce I/O
            if (txData.length > 0) {
              await tx.vaultTransaction.createMany({ data: txData });
            }

            // Update each user sharePoints (parallel within transaction)
            await Promise.all(
              distributions.map((d) =>
                tx.user.update({
                  where: { username: d.username },
                  data: { sharePoints: { increment: d.amount } },
                  select: { username: true },
                }),
              ),
            );

            // Update guild balance (do this once per guild)
            await tx.guild.update({
              where: { id: guild.id },
              data: {
                vaultBalance: runningBalance,
              },
              select: { vaultBalance: true },
            });
          });

          // Note: we purposely DO NOT reset weeklySharePoints here per-guild to limit DB calls.
          // We'll perform a single global reset for all guild members after processing all guilds.

          // Announce distribution via Cosmic Herald
          const message = `<b>Weekly Guild Rewards Distributed!</b>\n\nGuild <b>${
            guild.name
          }</b> received a distribution of <b>${pool.toFixed(
            2,
          )}</b> RES, allocated among ${distributions.length} members.`;

          await InngestEventDispatcher.sendHeraldAnnouncement(
            message,
            "announcement",
          );

          logger.info("Successfully distributed rewards for guild", {
            guildId,
            pool,
            allocated,
          });

          return { guildId, processed: true, pool, allocated };
        } catch (err) {
          logger.error("Error processing guild distribution", { guildId, err });
          throw err; // let Inngest handle retries for this guild step
        }
      });
    }

    // After processing all guilds, reset weeklySharePoints globally to mark new week
    await step.run("reset-weekly-sharepoints", async () => {
      logger.info(
        "Resetting weeklySharePoints for all guild members and guilds (single DB call)",
      );

      const [membersUpdated, guildsUpdated] = await prisma.$transaction([
        prisma.guildMember.updateMany({
          where: {},
          data: { weeklySharePoints: 0 },
        }),
        prisma.guild.updateMany({
          where: {},
          data: { weeklyActivity: 0 },
        }),
      ]);

      logger.info("Weekly sharePoints reset completed", {
        members: membersUpdated.count,
        guilds: guildsUpdated.count,
      });
      return {
        membersResetCount: membersUpdated.count,
        guildsResetCount: guildsUpdated.count,
      };
    });

    return { message: "Weekly reward distribution completed" };
  },
);
