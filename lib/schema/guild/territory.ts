import { z } from "zod";
import { isValidCell } from "h3-js";

import { TERRITORY_MIN_STAKE } from "@/config/guilds/constants";

/**
 * Schema for joining guild
 */
export const StakeTerritorySchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  guildId: z.string().min(1, "Guild Id is required"),
  hexId: z.string().refine((s) => isValidCell(s), "Invalid hexId"),
  stakeAmount: z.coerce.number().min(TERRITORY_MIN_STAKE),
});

export type StakeTerritoryParams = z.infer<typeof StakeTerritorySchema>;
