import { z } from "zod";

export const CreateChamberSchema = z.object({
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

export const MaintainChamberSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  chamberId: z.string().min(1, "Chamber Id is required"),
});

export type CreateChamberParams = z.infer<typeof CreateChamberSchema>;

export type MaintainChamberParams = z.infer<typeof MaintainChamberSchema>;

export type CreateChamberResponse = {
  chamberId: string;
  cost: number;
  level: number;
  boost: number;
};

export type DeactivateChamberResponse = {
  refund: number;
  refundPercentage: number;
};

export type MaintainChamberResponse = {
  cost: number;
  durabilityRestored: number;
  newDurability: number;
  nextMaintenanceDue: Date;
};

export type UpgradeChamberResponse = {
  newLevel: number;
  newBoost: number;
  cost: number;
};
