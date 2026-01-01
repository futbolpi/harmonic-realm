import { z } from "zod";

/**
 * Schema for depositing to guild vault
 */
export const VaultDepsositSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  guildId: z.string().min(1, "Guild Id is required"),
  amount: z.number().min(1, "Amount should be greater than 0"),
});

export type VaultDepsositParams = z.infer<typeof VaultDepsositSchema>;
