import { z } from "zod";

export const GuildSettingsSchema = z.object({
  accessToken: z.string(),
  guildId: z.string(),
  emblem: z.emoji().optional(),
  description: z.string().max(200).optional(),
  isPublic: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  minRF: z.number().min(0).max(100).optional(),
  autoKickInactive: z.boolean().optional(),
});

export type GuildSettingsParams = z.infer<typeof GuildSettingsSchema>;
