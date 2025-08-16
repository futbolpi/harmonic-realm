import { Achievement } from "@/lib/generated/prisma/client";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
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
      return ach.miningSessionsRequired === null
        ? false
        : sessions >= ach.miningSessionsRequired;
    case "UNIQUE_REALMS_MINED":
      const realms = await prisma.miningSession.findMany({
        where: { userId, status: "COMPLETED" },
        distinct: ["latitudeBin", "longitudeBin"],
      });
      return ach.uniqueRealmsRequired === null
        ? false
        : realms.length >= ach.uniqueRealmsRequired;
    case "UPGRADES_PURCHASED":
      const upgrades = await prisma.userNodeUpgrade.count({
        where: { userId },
      });
      return ach.upgradesPurchasedRequired === null
        ? false
        : upgrades >= ach.upgradesPurchasedRequired;
    case "PLAYER_LEVEL":
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      });
      if (!user?.level || ach.playerLevelRequired === null) {
        return false;
      }
      return user.level >= ach.playerLevelRequired;
    case "MASTERY_LEVEL":
      if (!ach.masteryLevelRequired) {
        return false;
      }
      const mastery = await prisma.userNodeMastery.findFirst({
        where: { userId, level: { gte: ach.masteryLevelRequired } },
      });
      return !!mastery;
    case "PHASE_TRIGGERED":
      // handled by phase completed workflow
      return false;
    case "GUILD_PHASE_CONTRIBUTION":
      // Placeholder: Check guild contributions (future feature)
      return false;
    case "LORE_FRAGMENTS_COLLECTED":
      const fragments = await prisma.firmwareBoost.count({ where: { userId } });
      return (
        ach.loreFragmentsCollectedRequired !== null &&
        fragments >= ach.loreFragmentsCollectedRequired
      );
    case "BOOSTS_USED":
      const boosts = await prisma.firmwareBoost.count({
        where: { userId, noOfSessions: 0 },
      });
      return !!ach.boostsUsedRequired && boosts >= ach.boostsUsedRequired;
    case "MINED_NODE_RARITY":
      const rareNodes = await prisma.miningSession.count({
        where: {
          userId,
          status: "COMPLETED",
          node: { type: { rarity: NodeTypeRarity.Legendary } },
        },
      });
      return rareNodes >= 1;
    case "MAX_CONCURRENCY_MINED":
      // handled by complete mining session
      return false;
    case "UNIQUE_BINS_MINED":
      const bins = await prisma.miningSession.findMany({
        where: { userId, status: "CANCELLED" },
        distinct: ["latitudeBin", "longitudeBin"],
      });
      return ach.uniqueBinsMinedRequired === null
        ? false
        : bins.length >= ach.uniqueBinsMinedRequired;
    case "SHARES_ACCUMULATED":
      const userShares = await prisma.user.findUnique({
        where: { id: userId },
        select: { sharePoints: true },
      });
      if (!userShares || !ach.sharesAccumulatedRequired) {
        return false;
      }
      return userShares.sharePoints >= ach.sharesAccumulatedRequired;
    case "SESSIONS_PER_PHASE":
      const phaseSessions = await prisma.miningSession.count({
        where: {
          userId,
          status: "COMPLETED",
          node: {
            phase: {
              equals: (
                await prisma.gamePhase.findFirst({
                  orderBy: { phaseNumber: "desc" },
                })
              )?.phaseNumber,
            },
          },
        },
      });
      return ach.sessionsPerPhaseRequired === null
        ? false
        : phaseSessions >= ach.sessionsPerPhaseRequired;
    // case "MINI_TASKS_COMPLETED":
    //   const tasks = await prisma.miniTask.count({
    //     where: { userId, completed: true },
    //   }); // Assume MiniTask model
    //   return tasks >= (ach.miniTasksCompletedRequired || 0);
    case "BOOSTS_TYPES_USED":
      const boostTypes = await prisma.firmwareBoost.findMany({
        where: { userId },
        distinct: ["boostType"],
      });
      return ach.boostsTypesUsedRequired === null
        ? false
        : boostTypes.length >= ach.boostsTypesUsedRequired;
    // case "FRIENDS_INVITED":
    //   const invites = await prisma.invite.count({
    //     where: { inviterId: userId },
    //   }); // Assume Invite model
    //   return invites >= (ach.friendsInvitedRequired || 0);
    case "NODE_TYPES_MASTERED":
      // Reach level 20 and master 5 NodeTypes.
      const [userLevel, distictMasteries] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { level: true },
        }),
        prisma.userNodeMastery.count({
          where: { userId },
        }),
      ]);

      if (
        !userLevel ||
        !ach.nodeTypesMasteredRequired ||
        !ach.playerLevelRequired
      ) {
        return false;
      }
      return (
        distictMasteries >= ach.nodeTypesMasteredRequired &&
        userLevel.level >= ach.playerLevelRequired
      );
    case "SHARES_HELD":
      const sharesHeld = await prisma.user.findUnique({
        where: { id: userId },
        select: { sharePoints: true },
      });
      if (!sharesHeld || !ach.sharesHeldRequired) {
        return false;
      }
      return sharesHeld.sharePoints >= ach.sharesHeldRequired;
    case "PHASES_SURVIVED":
      const phases = await prisma.node.findMany({
        where: { sessions: { some: { userId } } },
        distinct: ["phase"],
      });
      return ach.phasesSurvivedRequired === null
        ? false
        : phases.length >= ach.phasesSurvivedRequired;
    case "ECHO_INTENSITY":
      if (!ach.echoIntensityRequired) {
        return false;
      }
      const highIntensity = await prisma.miningSession.count({
        where: {
          userId,
          node: { echoIntensity: { gte: ach.echoIntensityRequired } },
        },
      });
      return highIntensity >= 1;
    case "LORE_FRAGMENTS_PER_PHASE":
      // Placeholder: Requires phase-specific fragment tracking
      return false;
    default:
      return false;
  }
}
