import { z } from "zod";

export const TuningSubmissionSchema = z.object({
  nodeId: z.string(),
  userLat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  userLng: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  accuracyScore: z.number().min(0).max(100),
  accessToken: z.string().min(1, "Access token is required"),
});

export const TuningSessionSchema = z.object({
  playCount: z.number().int(),
  currentStreak: z.number().int(),
});

export type TuningSubmissionParams = z.infer<typeof TuningSubmissionSchema>;
export type TuningSession = z.infer<typeof TuningSessionSchema>;
