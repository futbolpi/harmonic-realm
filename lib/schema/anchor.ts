import { z } from "zod";

/**
 * Schema for initiating resonant node anchoring
 */
export const InitiateNodeAnchoringSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  accessToken: z.string().min(1, "Access token is required"),
});

export type InitiateNodeAnchoringParams = z.infer<
  typeof InitiateNodeAnchoringSchema
>;
