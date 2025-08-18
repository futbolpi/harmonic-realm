import { z } from "zod";

import { NodeTypeRarity, SessionStatus } from "../generated/prisma/enums";

export const NodeSessionSchema = z.object({
  id: z.string(),
  minerSharesEarned: z.number(),
  status: z.enum(SessionStatus),
  startTime: z.coerce.date(),
  nodeId: z.string(),
  user: z.object({ username: z.string() }),
  node: z.object({
    type: z.object({ name: z.string(), lockInMinutes: z.number() }),
    echoIntensity: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    name: z.string(),
  }),
  endTime: z.coerce.date().nullable(),
});

// Node Schema
export const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  openForMining: z.boolean(),
  sponsor: z.string().nullable(),
  sessions: z.array(NodeSessionSchema),
  type: z.object({
    id: z.string(),
    name: z.string(),
    baseYieldPerMinute: z.number(),
    maxMiners: z.number(),
    lockInMinutes: z.number(),
    rarity: z.enum(NodeTypeRarity),
    iconUrl: z.string().nullable(),
  }),
});

export type Node = z.infer<typeof NodeSchema>;
