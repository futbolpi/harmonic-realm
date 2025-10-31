import { z } from "zod";

export const InitiateCalibrationSchema = z.object({
  piContributed: z.number().positive("Pi amount must be greater than 0"),
  currentLat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  currentLon: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  accessToken: z.string().min(1, "Access token is required"),
});

export type InitiateCalibrationParams = z.infer<
  typeof InitiateCalibrationSchema
>;
