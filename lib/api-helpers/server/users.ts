import { isValidAccessToken } from "@/lib/pi/platform-api-client";
import prisma from "@/lib/prisma";
import { UserProfile } from "@/lib/schema/user";

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
    select: { id: true },
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
      totalEarned: true,
      username: true,
      achievements: {
        orderBy: { unlockedAt: "desc" },
        take: 3,
        select: {
          id: true,
          achievement: {
            select: { icon: true, name: true, description: true },
          },
        },
      },
      sessions: {
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
          id: true,
          status: true,
          minerSharesEarned: true,
          node: {
            select: { type: { select: { name: true, lockInMinutes: true } } },
          },
        },
      },
    },
  });
  return user;
}
