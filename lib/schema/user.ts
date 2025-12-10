import { z } from "zod";

import { SessionStatus } from "../generated/prisma/enums";

// User Profile Achievement Schema
const UserProfileAchievementSchema = z.object({
  id: z.string(),
  achievement: z.object({
    name: z.string(),
    description: z.string(),
    icon: z.string().nullable(),
  }),
});

// User Profile Session Schema
const UserProfileSessionSchema = z.object({
  id: z.string(),
  minerSharesEarned: z.number(),
  status: z.enum(SessionStatus),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullish(),
  nodeId: z.string(),
  user: z.object({ username: z.string() }),
  node: z.object({
    type: z.object({ name: z.string(), lockInMinutes: z.number() }),
    name: z.string(),
    echoIntensity: z.number(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  sharePoints: z.number(),
  totalEarned: z.number(),
  level: z.number(),
  xp: z.number(),
  noOfReferrals: z.number(),
  resonanceFidelity: z.number(),
  hasCompletedTutorial: z.boolean().default(false),
  _count: z.object({ sessions: z.number(), achievements: z.number() }),
  achievements: z.array(UserProfileAchievementSchema),
  sessions: z.array(UserProfileSessionSchema),
});

// Types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserProfileAchievement = z.infer<
  typeof UserProfileAchievementSchema
>;
export type UserProfileSession = z.infer<typeof UserProfileSessionSchema>;
