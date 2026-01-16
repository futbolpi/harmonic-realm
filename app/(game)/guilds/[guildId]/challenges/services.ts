import prisma from "@/lib/prisma";

/**
 * Fetch challenge data for the guild challenges page
 * Separates active, completed, and available challenges
 */
export async function getGuildChallengesData(guildId: string) {
  const now = new Date();

  // Fetch guild info
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      id: true,
      name: true,
      vaultLevel: true,
      _count: { select: { members: { where: { isActive: true } } } },
    },
  });

  if (!guild) return null;

  // Fetch active challenges for this guild
  const activeChallenges = await prisma.challengeProgress.findMany({
    where: {
      guildId,
      completed: false,
      challenge: { endDate: { gt: now } },
    },
    select: {
      id: true,
      currentValue: true,
      targetValue: true,
      updatedAt: true,
      challenge: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          rewardResonance: true,
          rewardPrestige: true,
          template: {
            select: {
              name: true,
              icon: true,
              description: true,
              difficulty: true,
              goalType: true,
            },
          },
        },
      },
      contributions: true,
    },
  });

  // Fetch completed challenges from this week
  const completedChallenges = await prisma.challengeProgress.findMany({
    where: {
      guildId,
      completed: true,
      completedAt: {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      currentValue: true,
      targetValue: true,
      completedAt: true,
      challenge: {
        select: {
          id: true,
          rewardResonance: true,
          rewardPrestige: true,
          template: {
            select: {
              name: true,
              icon: true,
              difficulty: true,
            },
          },
        },
      },
      contributions: true,
    },
  });

  // Get all active challenge template IDs (both active and completed)
  const usedChallengeIds = new Set([
    ...activeChallenges.map((c) => c.challenge.id),
    ...completedChallenges.map((c) => c.challenge.id),
  ]);

  // Fetch available challenges that this guild hasn't accepted yet
  const allAvailableTemplates = await prisma.guildChallenge.findMany({
    where: {
      template: {
        frequency: "WEEKLY",
        minMembers: { lte: guild._count.members },
        minVaultLevel: { lte: guild.vaultLevel },
      },
      endDate: { gt: now },
    },
    select: {
      id: true,
      endDate: true,
      startDate: true,
      template: {
        select: {
          id: true,
          name: true,
          icon: true,
          description: true,
          difficulty: true,
          goalType: true,
          targetValue: true,
          minMembers: true,
          minVaultLevel: true,
          resonanceReward: true,
          prestigeReward: true,
        },
      },
    },
  });

  // Filter out challenges already in active/completed progress
  const availableTemplates = allAvailableTemplates.filter(
    (template) => !usedChallengeIds.has(template.id)
  );

  return {
    guild,
    active: activeChallenges,
    completed: completedChallenges,
    available: availableTemplates,
  };
}

export type GuildChallengesData = NonNullable<
  Awaited<ReturnType<typeof getGuildChallengesData>>
>;
