import { siteConfig } from "@/config/site";

export const getTotalMainnetKYCPioneers = async () => {
  if (siteConfig.network === "testnet") {
    return 100000;
  }
  // should call api
  return 12000000;
};

/**
 * New function: Calculates the effective number of pioneers for a given phase, incorporating the halving lore.
 * In the Pi Cosmos lore, each phase represents a "Harmonic Diminishing" – where the lattice's energy halves,
 * symbolizing the infinite yet converging nature of pi's series, creating scarcity and urging Pioneers to
 * harmonize more deeply.
 * Phase 1 (Genesis): 50% of total (initial awakening).
 * Subsequent phases: Halve the previous allocation (e.g., Phase 2: 25%, Phase 3: 12.5%),
 * capping at a minimum to avoid zero spawns.
 * @param phase Game phase
 * @returns Effective number of pioneers for given phase
 */
export async function getEffectivePioneersForPhase(
  phase: number
): Promise<number> {
  if (phase < 1) throw new Error("Phase must be at least 1");

  const totalMainnetKYCPioneers = await getTotalMainnetKYCPioneers();

  if (totalMainnetKYCPioneers <= 0)
    throw new Error("Total pioneers must be positive");

  const halvingFactor = 1 / Math.pow(2, phase - 1); // Halving: 1.0, 0.5, 0.25, 0.125...
  const effectivePioneers = Math.max(
    1,
    Math.floor(totalMainnetKYCPioneers * halvingFactor)
  ); // Min 1 to ensure some spawns

  return effectivePioneers;
}

export const getNumberOfPhaseNodes = async (gamePhase: number) => {
  const effectivePioneers = await getEffectivePioneersForPhase(gamePhase);
  const nofNodes = Math.max(1, Math.floor(effectivePioneers / 1000)); // Min 1 to ensure some spawns

  return nofNodes;
};
