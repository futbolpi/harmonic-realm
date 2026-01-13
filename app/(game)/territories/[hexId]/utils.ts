import { differenceInDays } from "date-fns";

import { TerritoryDetail } from "./services";

/**
 * Get territory control expiration details
 */
export function getTerritoryControlStatus(territory: {
  controlledAt: Date | null;
  controlEndsAt: Date | null;
  activeChallenge: { endsAt?: Date } | null;
}) {
  if (!territory.controlledAt || !territory.controlEndsAt) {
    return { status: "unclaimed", daysRemaining: null };
  }

  const daysRemaining = Math.ceil(
    differenceInDays(territory.controlEndsAt, new Date())
  );

  if (territory.activeChallenge) {
    return {
      status: "under_challenge",
      daysRemaining: Math.max(daysRemaining, 0),
      challengeEndsAt: territory.activeChallenge.endsAt,
    };
  }

  return {
    status: daysRemaining > 0 ? "controlled" : "expired",
    daysRemaining: Math.max(daysRemaining, 0),
  };
}

/**
 * Get territory category based on traffic score
 */
export function getTerritoryCategory(
  trafficScore: number
): "low" | "medium" | "high" {
  if (trafficScore > 200) return "high";
  if (trafficScore > 100) return "medium";
  return "low";
}

/**
 * Format territory data for client-side use
 */
export function formatTerritoryDetail(territory: TerritoryDetail) {
  const category = getTerritoryCategory(territory.trafficScore);
  const controlStatus = getTerritoryControlStatus(territory);

  return {
    ...territory,
    category,
    controlStatus,
  };
}

export type ClientTerritoryDetail = ReturnType<typeof formatTerritoryDetail>;
