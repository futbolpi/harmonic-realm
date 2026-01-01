import { z } from "zod";

/**
 * Schema for joining guild
 */
export const JoinGuildSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  guildId: z.string().min(1, "Guild Id is required"),
});

export type JoinGuildParams = z.infer<typeof JoinGuildSchema>;
