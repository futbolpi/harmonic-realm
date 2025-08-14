import { z } from "zod";

import { NodeTypeRarity } from "../generated/prisma/enums";

export const NodeSessionSchema = z.object({
  endTime: z.coerce.date().nullable(),
  minerSharesEarned: z.number(),
  user: z.object({ username: z.string() }),
});

// Node Schema
export const NodeSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  openForMining: z.boolean(),
  sponsor: z.string().nullable(),
  sessions: z.array(NodeSessionSchema),
  type: z.object({
    id: z.number(),
    name: z.string(),
    baseYieldPerMinute: z.number(),
    maxMiners: z.number(),
    lockInMinutes: z.number(),
    rarity: z.enum(NodeTypeRarity),
    iconUrl: z.string().nullable(),
  }),
});

export type Node = z.infer<typeof NodeSchema>;
