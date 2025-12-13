import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";

export const DRIFT_COOL_DOWN_DAYS = 3;

export const ALLOWED_INACTIVITY_DAYS = 7;

export const VOID_ZONE_RADIUS_KM = 10;

export const MAX_DRIFT_DISTANCE_KM = 100;

export const rarityMultipliers: Record<NodeTypeRarity, number> = {
  Common: 1.0,
  Uncommon: 2.5,
  Rare: 6.25, // 2.5²
  Epic: 15.625, // 2.5³
  Legendary: 39.0625, // 2.5⁴
};
