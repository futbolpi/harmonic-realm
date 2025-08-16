/**
 * Calculates the mining session threshold for triggering phase p, based on the Pi Cosmos lore
 * where collective echoes (sessions) harmonize the lattice, with Fibonacci scaling for progression,
 * pi for cosmic essence, and escalation for diminishing returns as nodes halve.
 * @param phase game phase
 * @returns mining session threshold
 */
export function calculatePhaseThreshold(phase: number): number {
  if (phase < 2)
    throw new Error("Phase must be at least 2 for threshold calculations");

  const pi = Math.PI; // 3.14159, the cosmic constant
  const cosmicBaseline = 500_000; // Base sessions, tuned for ~1-month phase with 1.2M players
  const fibonacci = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]; // Up to phase 10; extend as needed
  if (phase > fibonacci.length - 1)
    throw new Error("Phase exceeds Fibonacci sequence limit");

  const escalationFactor = 1 + (phase - 1) * 0.5; // 50% harder per phase, reflecting halving
  const threshold = Math.round(
    pi * fibonacci[phase] * cosmicBaseline * escalationFactor
  );

  return threshold;
}
