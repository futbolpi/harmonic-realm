import { z } from "zod";

/**
 * Schema for creating guild
 */
export const CreateGuildSchema = z.object({
  name: z
    .string()
    .min(3, "Guild name must be at least 3 characters")
    .max(24, "Guild name must be at most 24 characters"),
  description: z
    .string()
    .max(200, "Guild description should be less than 200 characters"),
  tag: z
    .string()
    .min(3, "Tag should be 3 characters")
    .max(4, "Tag should be 4 characters or less")
    .transform((value) => value.replace(/\s/g, "").toUpperCase()),
  emblem: z.emoji(),
  requireApproval: z.boolean(),
  minRF: z.number().min(0).max(20),
  autoKickInactive: z.boolean(),
  accessToken: z.string().min(1, "Access token is required"),
});

export type CreateGuildParams = z.infer<typeof CreateGuildSchema>;
