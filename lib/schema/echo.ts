import { z } from "zod";

import { EchoResonatorStatus } from "../generated/prisma/enums";

export const EchoTransmissionSchema = z.object({
  id: z.string(),
  status: z.enum(EchoResonatorStatus),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  chargeLevel: z.number(),
  lastChargedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  usedNodeIds: z.array(z.string()),
  totalUsageCount: z.number(),
  maxTimeReduction: z.number(),
});

export const ApplyEchoTransmissionSchema = z.object({
  sessionId: z.string(),
  nodeId: z.string(),
  accessToken: z.string(),
  adId: z.string().optional(),
});

export type EchoTransmissionType = z.infer<typeof EchoTransmissionSchema>;
export type ApplyEchoTransmissionParams = z.infer<
  typeof ApplyEchoTransmissionSchema
>;
