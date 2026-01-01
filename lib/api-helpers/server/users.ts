import { isValidAccessToken } from "@/lib/pi/platform-api-client";
import prisma from "@/lib/prisma";
import { UserProfile } from "@/lib/schema/user";
import { calculateLevelFromXp } from "@/lib/utils/xp";

export async function verifyTokenAndGetUser(accessToken: string) {
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const isValidToken = isValidAccessToken(accessToken);

  if (!isValidToken) {
    throw new Error("Invalid token");
  }

  const dbUser = await prisma.user.findUnique({
    where: { accessToken },
    select: { id: true, piId: true, username: true },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  return dbUser;
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      _count: {
        select: {
          sessions: { where: { status: "COMPLETED" } },
          achievements: true,
        },
      },
      xp: true,
      id: true,
      level: true,
      sharePoints: true,
      noOfReferrals: true,
      resonanceFidelity: true,
      totalEarned: true,
      username: true,
      driftCount: true,
      lastDriftAt: true,
      achievements: {
        orderBy: { unlockedAt: "desc" },
        select: {
          id: true,
          achievement: {
            select: { icon: true, name: true, description: true },
          },
        },
      },
      sessions: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          status: true,
          minerSharesEarned: true,
          startTime: true,
          nodeId: true,
          endTime: true,
          user: { select: { username: true } },
          node: {
            select: {
              type: { select: { name: true, lockInMinutes: true } },
              name: true,
              echoIntensity: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
      hasCompletedTutorial: true,
      guildMembership: {
        select: {
          guildId: true,
          role: true,
          isActive: true,
          vaultContribution: true,
        },
      },
    },
  });
  return user;
}

export async function awardXp(userId: string, xpGained: number) {
  // 1. Increment XP and fetch updated values
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: xpGained } },
    select: { xp: true, level: true },
  });

  // 2. Compute new level based on updated XP
  const newLevel = calculateLevelFromXp(user.xp);

  let leveledUp = false;

  // 3. If user has leveled up, persist the new level
  if (newLevel > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
    leveledUp = true;
  }

  return { xp: user.xp, level: newLevel, leveledUp };
}

export const getReferrer = async (username: string) => {
  return prisma.user.findFirst({
    where: { username },
    select: { username: true },
  });
};
