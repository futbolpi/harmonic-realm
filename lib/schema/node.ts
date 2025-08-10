import { z } from "zod";

import { $Enums } from "../generated/prisma";

// Node Schema
export const NodeSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  openForMining: z.boolean(),
  sponsor: z.string().optional(),
  type: z.object({
    id: z.number(),
    name: z.string(),
    baseYieldPerMinute: z.number(),
    maxMiners: z.number(),
    lockInMinutes: z.number(),
    rarity: z.enum($Enums.NodeTypeRarity),
    iconUrl: z.string().optional(),
  }),
});

// Nodes Response Schema
export const NodesResponseSchema = z.object({
  nodes: z.array(NodeSchema),
  userLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export type Node = z.infer<typeof NodeSchema>;
export type NodesResponse = z.infer<typeof NodesResponseSchema>;
