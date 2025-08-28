import { Decimal } from "@prisma/client/runtime/library";

import { ContributionTier } from "../generated/prisma/enums";

export function calculateContributionTier(piAmount: Decimal): ContributionTier {
  const amount = piAmount.toNumber();
  if (amount >= 50) return "COSMIC_FOUNDER";
  if (amount >= 10) return "LATTICE_ARCHITECT";
  if (amount >= 1) return "RESONANCE_PATRON";
  return "ECHO_SUPPORTER";
}

export function estimateCompletionTime(piRequired: number): string {
  // Rough estimation based on typical community contribution patterns
  if (piRequired <= 0.5) return "1-2 hours";
  if (piRequired <= 2) return "2-6 hours";
  if (piRequired <= 5) return "6-24 hours";
  if (piRequired <= 10) return "1-3 days";
  return "3-7 days";
}
