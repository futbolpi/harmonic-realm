import { z } from "zod";

import { $Enums } from "../generated/prisma";

// Node Schema
export const NodeSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  openForMining: z.boolean(),
  sponsor: z.string().nullable(),
  type: z.object({
    id: z.number(),
    name: z.string(),
    baseYieldPerMinute: z.number(),
    maxMiners: z.number(),
    lockInMinutes: z.number(),
    rarity: z.enum($Enums.NodeTypeRarity),
    iconUrl: z.string().nullable(),
  }),
});

export type Node = z.infer<typeof NodeSchema>;
