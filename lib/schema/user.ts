import { z } from "zod";

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  piUid: z.string(),
  piUsername: z.string(),
  displayName: z.string().optional(),
  level: z.number(),
  experience: z.number(),
  minerShares: z.number(),
  totalEarned: z.number(),
  piBalance: z.number(),
  isVerified: z.boolean(),
  lastActive: z.string().transform((val) => new Date(val)),
  createdAt: z.string().transform((val) => new Date(val)),
});

// User Stats Schema
export const UserStatsSchema = z.object({
  profile: UserProfileSchema,
  stats: z.object({
    totalSessions: z.number(),
    activeSessions: z.number(),
    nodesDiscovered: z.number(),
    achievements: z.number(),
    weeklyEarnings: z.number(),
    rank: z.number().optional(),
    nextLevelXP: z.number(),
    currentXP: z.number(),
  }),
  recentSessions: z.array(
    z.object({
      id: z.string(),
      nodeId: z.string(),
      nodeName: z.string().optional(),
      earned: z.number(),
      duration: z.number(),
      status: z.enum(["COMPLETED", "ACTIVE", "ABANDONED"]),
      createdAt: z.string().transform((val) => new Date(val)),
    })
  ),
  achievements: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      category: z.string(),
      unlocked: z.boolean(),
      unlockedAt: z
        .string()
        .transform((val) => new Date(val))
        .optional(),
    })
  ),
});

// Types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
