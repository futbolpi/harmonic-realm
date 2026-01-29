import { addDays } from "date-fns";

import type { DefaultArgs } from "@prisma/client/runtime/client";
import {
  GUILD_ACTIVITIES,
  TERRITORY_CONTROL_DAYS,
} from "@/config/guilds/constants";
import type { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Shared helper to resolve a territory challenge inside a transaction.
 * - This function DOES NOT call $transaction itself; callers should run it inside a tx or pass a tx client.
 * - Returns an object with resolution details for logging/announcements.
 */

export async function resolveTerritoryChallenge(
  _tx: Omit<
    PrismaClient<never, undefined, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
  >,
  ch: {
    id: string;
    territoryId: string;
    attackerId: string;
    defenderId: string;
    attackerStake: number;
    defenderStake: number;
    attackerScore: number | null;
    defenderScore: number | null;
  },
) {
  // Determine winner (attacker must strictly exceed defender to win)
  const winnerId =
    (ch.attackerScore ?? 0) > (ch.defenderScore ?? 0)
      ? ch.attackerId
      : ch.defenderId;

  const winnerStake =
    winnerId === ch.attackerId ? ch.attackerStake : ch.defenderStake;
  const loserStake =
    winnerId === ch.attackerId ? ch.defenderStake : ch.attackerStake;

  const winnerReward = loserStake * 0.7; // 70% to winner vault
  // const burnAmount = loserStake * 0.3; // burned — accounted for by not transferring it anywhere

  // Read winner guild data for accounting/logging

  const winnerGuild = await _tx.guild.findUnique({
    where: { id: winnerId },
    select: { vaultBalance: true, leaderUsername: true, name: true },
  });

  const now = new Date();

  await Promise.all([
    // Transfer territory and credit winner vault, mark challenge resolved, and write vault txs
    _tx.territory.update({
      where: { id: ch.territoryId },
      data: {
        guildId: winnerId,
        currentStake: winnerStake,
        controlledAt: now,
        controlEndsAt: addDays(now, TERRITORY_CONTROL_DAYS),
        activeChallengeId: null,
      },
      select: { id: true },
    }),
    _tx.guild.update({
      where: { id: winnerId },
      data: {
        vaultBalance: { increment: winnerReward },
        weeklyActivity: {
          increment: GUILD_ACTIVITIES.territoryVictory.weeklyActivity,
        },
      },
      select: { id: true },
    }),
    _tx.territoryChallenge.update({
      where: { id: ch.id },
      data: { resolved: true, winnerId },
      select: { id: true },
    }),
    // Record vault transaction for winner (audit)
    _tx.vaultTransaction.create({
      data: {
        memberUsername: winnerGuild?.leaderUsername ?? "system",
        type: "REWARD",
        amount: winnerReward,
        balanceBefore: winnerGuild?.vaultBalance ?? 0,
        balanceAfter: (winnerGuild?.vaultBalance ?? 0) + winnerReward,
        reason: "Territory challenge reward",
        metadata: { challengeId: ch.id },
      },
      select: { id: true },
    }),
  ]);

  return {
    winnerId,
    winnerName: winnerGuild?.name,
    reward: winnerReward,
    leaderUsername: winnerGuild?.leaderUsername,
  };
}
