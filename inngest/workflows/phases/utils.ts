// lib/utils/generatePhaseAnnouncement.ts

import { env } from "@/env";

/**
 * Generates a Telegram HTML parse mode message template announcing the completion of a phase node generation event.
 * @param numberOfNodesSpawned - Number of new nodes spawned in the phase
 * @param phase - Phase name (e.g., "Genesis", "Threshold 1")
 * @returns Telegram HTML message string
 */
export function generatePhaseAnnouncement(
  numberOfNodesSpawned: number,
  phase: string
): string {
  // Fallback for invalid inputs
  if (numberOfNodesSpawned <= 0 || !phase) {
    return `🌌 <i>The Lattice stirs, but no new Echo Nodes have resonated.</i> Join <b>HarmonicRealm</b> to awaken the next phase! <a href="${env.NEXT_PUBLIC_PINET_URL}">Explore now</a> #HarmonicRealm`;
  }

  // Lore-inspired phase descriptors
  const phaseDescriptors: Record<string, string> = {
    Genesis:
      "birth of the Lattice, where Pi's infinite rhythm first pulsed into reality",
    Threshold: `convergence of cosmic frequencies, unlocking deeper mysteries in phase ${phase}`,
  };

  // Select descriptor or fallback
  const phaseKey = phase.toLowerCase().startsWith("threshold")
    ? "Threshold"
    : phase;
  const descriptor =
    phaseDescriptors[phaseKey] ||
    `unveiling of ${phase}, a new chapter in the Lattice's cosmic saga`;

  // Dynamic node count message
  const nodeMessage =
    numberOfNodesSpawned === 1
      ? "A single <b>Echo Node</b> has awakened, pulsing with Pi's eternal rhythm."
      : `${numberOfNodesSpawned} new <b>Echo Nodes</b> have resonated across the globe, each a beacon of cosmic truth.`;

  // Construct the HTML message
  const message =
    `🌌 <b>Harmonic Awakening: ${phase} Complete!</b> 🌌\n\n` +
    `<i>The Lattice hums with power!</i> ${nodeMessage} In this ${descriptor}, new stories await at sacred sites. ` +
    `Will you stake <b>Pi</b> to unveil their mysteries or broadcast their echoes to the world?\n\n` +
    `🔮 <a href="${env.NEXT_PUBLIC_PINET_URL}">Explore now</a>\n` +
    `📣 Join the resonance: #HarmonicRealm`;

  return message;
}
