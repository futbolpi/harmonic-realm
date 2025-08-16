import { Achievement } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

// Reusable: Check achievement requirements using enum
export async function checkAchievementRequirement(
  userId: string,
  ach: Achievement
): Promise<boolean> {
  switch (ach.requirementType) {
    case "MINING_SESSIONS":
      const sessions = await prisma.miningSession.count({
        where: { userId, status: "COMPLETED" },
      });
      return sessions >= (ach.miningSessionsRequired || 1);
    // case "UNIQUE_REALMS_MINED":
    //   const realms = await prisma.miningSession.findMany({
    //     where: { userId },
    //     distinct: ["latitudeBin", "longitudeBin"],
    //   });
    //   return realms.length >= (ach.uniqueRealmsRequired || 0);
    // case "UPGRADES_PURCHASED":
    //   const upgrades = await prisma.upgrade.count({ where: { userId } });
    //   return upgrades >= (ach.upgradesPurchasedRequired || 0);
    // case "PLAYER_LEVEL":
    //   const user = await prisma.user.findUnique({
    //     where: { id: userId },
    //     select: { level: true },
    //   });
    //   return user?.level >= (ach.playerLevelRequired || 0);
    // case "MASTERY_LEVEL":
    //   const mastery = await prisma.mastery.findFirst({
    //     where: { userId, level: { gte: ach.masteryLevelRequired || 0 } },
    //   });
    //   return !!mastery;
    // case "PHASE_TRIGGERED":
    //   const phaseAchievements = await prisma.userAchievement.count({
    //     where: { userId, achievement: { name: "Phase Awakener" } },
    //   });
    //   return phaseAchievements >= (ach.phaseTriggeredRequired || 0);
    // case "GUILD_PHASE_CONTRIBUTION":
    //   // Placeholder: Check guild contributions (future feature)
    //   return false;
    // case "LORE_FRAGMENTS_COLLECTED":
    //   const fragments = await prisma.loreFragment.count({ where: { userId } }); // Assume LoreFragment model
    //   return fragments >= (ach.loreFragmentsCollectedRequired || 0);
    // case "BOOSTS_USED":
    //   const boosts = await prisma.boostUsage.count({ where: { userId } }); // Assume BoostUsage model
    //   return boosts >= (ach.boostsUsedRequired || 0);
    // case "MINED_NODE_RARITY":
    //   const rareNodes = await prisma.miningSession.count({
    //     where: {
    //       userId,
    //       node: { type: { rarity: ach.minedNodeRarityRequired } },
    //     },
    //   });
    //   return rareNodes >= 1;
    // case "MAX_CONCURRENCY_MINED":
    //   const maxConcurrency = await prisma.miningSession.count({
    //     where: {
    //       userId,
    //       node: {
    //         maxMiners: {
    //           equals: prisma.miningSession.count({
    //             where: { nodeId: { equals: prisma.miningSession.nodeId } },
    //           }),
    //         },
    //       },
    //     },
    //   });
    //   return maxConcurrency >= (ach.maxConcurrencyMinedRequired || 0);
    // case "UNIQUE_BINS_MINED":
    //   const bins = await prisma.miningSession.findMany({
    //     where: { userId },
    //     distinct: ["latitudeBin", "longitudeBin"],
    //   });
    //   return bins.length >= (ach.uniqueBinsMinedRequired || 0);
    // case "SHARES_ACCUMULATED":
    //   const user = await prisma.user.findUnique({
    //     where: { id: userId },
    //     select: { shares: true },
    //   });
    //   return user?.shares >= (ach.sharesAccumulatedRequired || 0);
    // case "SESSIONS_PER_PHASE":
    //   const phaseSessions = await prisma.miningSession.count({
    //     where: {
    //       userId,
    //       phase: {
    //         equals: (
    //           await prisma.gamePhase.findFirst({
    //             orderBy: { phaseNumber: "desc" },
    //           })
    //         )?.phaseNumber,
    //       },
    //     },
    //   });
    //   return phaseSessions >= (ach.sessionsPerPhaseRequired || 0);
    // case "MINI_TASKS_COMPLETED":
    //   const tasks = await prisma.miniTask.count({
    //     where: { userId, completed: true },
    //   }); // Assume MiniTask model
    //   return tasks >= (ach.miniTasksCompletedRequired || 0);
    // case "BOOSTS_TYPES_USED":
    //   const boostTypes = await prisma.boostUsage.findMany({
    //     where: { userId },
    //     distinct: ["boostType"],
    //   });
    //   return boostTypes.length >= (ach.boostsTypesUsedRequired || 0);
    // case "FRIENDS_INVITED":
    //   const invites = await prisma.invite.count({
    //     where: { inviterId: userId },
    //   }); // Assume Invite model
    //   return invites >= (ach.friendsInvitedRequired || 0);
    // case "NODE_TYPES_MASTERED":
    //   const masteredTypes = await prisma.mastery.count({
    //     where: { userId, level: { gte: 3 } },
    //   });
    //   return masteredTypes >= (ach.nodeTypesMasteredRequired || 0);
    // case "SHARES_HELD":
    //   const userShares = await prisma.user.findUnique({
    //     where: { id: userId },
    //     select: { shares: true },
    //   });
    //   return userShares?.shares >= (ach.sharesHeldRequired || 0);
    // case "PHASES_SURVIVED":
    //   const phases = await prisma.miningSession.findMany({
    //     where: { userId },
    //     distinct: ["phase"],
    //   });
    //   return phases.length >= (ach.phasesSurvivedRequired || 0);
    // case "ECHO_INTENSITY":
    //   const highIntensity = await prisma.miningSession.count({
    //     where: {
    //       userId,
    //       node: { echoIntensity: { gte: ach.echoIntensityRequired || 0 } },
    //     },
    //   });
    //   return highIntensity >= 1;
    // case "LORE_FRAGMENTS_PER_PHASE":
    //   // Placeholder: Requires phase-specific fragment tracking
    //   return false;
    default:
      return false;
  }
}
