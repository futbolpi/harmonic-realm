import { z } from "zod";

/**
 * Validation schemas
 */
export const ResonateShardsSchema = z.object({
  guildId: z.string().min(1),
  templateId: z.string().min(1),
  accessToken: z.string().min(1),
  shards: z.number().int().min(1),
});

export type ResonateShardsInput = z.infer<typeof ResonateShardsSchema>;

export const CraftArtifactSchema = z.object({
  guildId: z.string().min(1),
  templateId: z.string().min(1),
  accessToken: z.string().min(1), // Officer initiating craft (not consuming shards)
});

export type CraftArtifactInput = z.infer<typeof CraftArtifactSchema>;

export const UpgradeArtifactSchema = z.object({
  guildId: z.string().min(1),
  artifactId: z.string().min(1),
  accessToken: z.string().min(1), // Officer initiating upgrade
});

export type UpgradeArtifactInput = z.infer<typeof UpgradeArtifactSchema>;

export const EquipArtifactSchema = z.object({
  guildId: z.string().min(1),
  equip: z.boolean().optional(),
  artifactId: z.string().min(1),
  accessToken: z.string().min(1), // Officer equipping
});

export type EquipArtifactInput = z.infer<typeof EquipArtifactSchema>;
