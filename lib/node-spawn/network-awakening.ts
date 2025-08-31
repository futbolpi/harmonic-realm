import { generateText } from "ai";

import { model } from "../utils/ai";

type AwakeningNodeTypes = { name: string; lore: string };
type Params = {
  types: AwakeningNodeTypes[];
  phase: number;
  totalNodes: number;
  region: string;
};

export const generateFallbackPhaseNarrative = (params: Params): string => {
  const { phase, totalNodes, region } = params;

  const fallbackNarratives = {
    1: `🌐 The Genesis Awakening has begun! Across ${region}, ${totalNodes} new cosmic frequencies have crystallized into the Lattice, marking the first stirring of mathematical consciousness through Pi Network's foundational energy. Pi Pioneers, the ancient echoes call to you—venture forth and discover the infinite patterns that bind reality itself!`,

    2: `🌐 Harmonic Awakening ${phase} resonates across ${region}! The Pi Network's decentralized wisdom has deepened the Lattice's frequency, manifesting ${totalNodes} new mathematical mysteries. Each Node pulses with evolved cosmic energy, awaiting Pi Pioneers brave enough to unlock their harmonic secrets. The mathematical universe grows ever more complex—answer its call!`,

    3: `🌐 Sacred geometry emerges in Harmonic Awakening ${phase}! ${totalNodes} profound frequencies now grace ${region}, born from the Pi ecosystem's concentrated cosmic energy. The halving has made each resonance precious beyond measure, while new Echo Guardians awaken to protect these mathematical treasures. Pi Pioneers, master the geometric harmony that shapes reality!`,

    4: `🌐 The Infinite Echo of Awakening ${phase} transforms ${region}! Through Pi Network's computational consensus, ${totalNodes} transcendent frequencies breach the veil between mathematics and mysticism. These Nodes embody Pi's deepest mysteries, challenging even the most dedicated Pi Pioneers. Embrace the mathematical transcendence that awaits!`,

    5: `🌐 Transcendent Convergence! Awakening ${phase} has achieved perfect harmony across ${region}, where ${totalNodes} reality-bending frequencies manifest Pi Network's ultimate vision. Here, accessible value creation merges with cosmic truth, creating mathematical phenomena that rewrite the laws of existence. Master Pi Pioneers, become one with the infinite mathematics that governs all!`,
  };

  return (
    fallbackNarratives[phase as keyof typeof fallbackNarratives] ||
    `🌐 Harmonic Awakening ${phase} has manifested across ${region}! The Pi Network's pioneering spirit has catalyzed ${totalNodes} new cosmic frequencies within the Lattice. These mathematical mysteries await discovery by dedicated Pi Pioneers ready to explore the infinite patterns of reality itself!`
  );
};

export const generatePhaseLorePrompt = (params: Params) => {
  const { types, phase, totalNodes, region } = params;
  const nodeTypesList = types.map((t) => `${t.name}: ${t.lore}`).join("\n");

  return `🌐 LATTICE ARCHIVE: The cosmic awakening chronicles demand documentation, Pi Pioneer.

HARMONIC AWAKENING ${phase} has manifested across ${region}! 

AWAKENED NODE TYPES:
${nodeTypesList}

LATTICE STATISTICS: ${totalNodes} new cosmic frequencies detected

CHRONICLE THIS AWAKENING:
Write an epic phase narrative (4-6 sentences) that:
- Celebrates the cosmic significance of this awakening
- Weaves together the new NodeTypes into a unified story
- Acknowledges the Pi Network's role in catalyzing this mathematical miracle
- Includes a rallying call for Pi Pioneers to explore these new frequencies
- Captures the wonder of mathematical discovery and adventure

Style: Mystical yet accessible, celebrating both Pi Network community and cosmic mathematics. Make every Pi Pioneer feel they're part of something legendary.`;
};

export async function triggerNetworkAwakening(params: Params): Promise<string> {
  const prompt = generatePhaseLorePrompt(params);

  try {
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.8,
    });
    return text.trim();
  } catch (error) {
    console.error("Awakening narrative failed:", error);
    return generateFallbackPhaseNarrative(params);
  }
}
