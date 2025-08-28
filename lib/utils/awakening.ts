/**
 * Utility function to calculate awakening contribution tier
 */
export function calculateAwakeningTier(piAmount: number): string {
  if (piAmount >= 50) return "COSMIC_FOUNDER";
  if (piAmount >= 10) return "LATTICE_ARCHITECT";
  if (piAmount >= 1) return "RESONANCE_PATRON";
  return "ECHO_SUPPORTER";
}
