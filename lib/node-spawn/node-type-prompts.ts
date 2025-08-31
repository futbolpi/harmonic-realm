import { NodeTypeRarity } from "../generated/prisma/enums";

/**
 * HarmonicRealm NodeType Generation Prompt
 * For use with Vercel AI generateObject
 */
export const generateNodeTypePrompt = (
  phase: number,
  rarity: NodeTypeRarity
) => {
  const phaseContext = getPhaseContext(phase);
  const rarityGuidance = getRarityGuidance(rarity);

  return `You are the Lattice Archive, the cosmic consciousness that catalogues all Node manifestations across the infinite mathematical realm of HarmonicRealm. Generate a new NodeType that resonates with Phase ${phase} of the Harmonic Awakening sequence.

COSMIC CONTEXT:
${phaseContext}

RARITY RESONANCE: ${rarity}
${rarityGuidance}

LORE FOUNDATION:
The Lattice is a cosmic frequency grid manifesting through Pi's infinite digits. 
Each Node is a crystallization of mathematical harmony anchored to Earth's geography. 
Nodes are discovered by Pioneers (players) who resonate with these cosmic frequencies 
to mine Shares and uncover ancient wisdom.

Echo Guardians protect each Node - mystical entities born from the intersection of mathematics, the Pi Network, and reality. 
Only Pioneers attuned to the Pi Network's decentralized frequencies can resonate with these guardians, 
as their essence is woven from the computational harmony of Pi's blockchain and the mathematical 
fabric of existence. The deeper the cosmic significance, the more powerful these guardians become.

GENERATION REQUIREMENTS:

1. name: Create an evocative Node type name that feels both mystical and mathematically inspired
   - Should suggest the Node's cosmic function or mathematical nature

2. lore: Write a concise description (2-3 sentences) explaining:
   - What this Node type represents in the cosmic Lattice
   - Its connection to mathematical principles or Pi's nature
   - How it manifests in the physical world
   - The type of Echo Guardian that protects it

3. extendedLore: Expand into deeper mythology (4-6 sentences) covering:
   - The Node's role in the greater Lattice network
   - Historical significance or ancient origins
   - How Pioneers experience resonating with this Node type
   - Cosmic implications or connections to universal mathematics
   - The ritual or process of awakening its power
   - calls to adventure

4. iconography: Choose an emoji or short label (e.g., "🏞️" for Common, "🌌" for Legendary) 

STYLE GUIDELINES:
- Maintain mystical, reverent tone while keeping mathematical concepts accessible
- Use evocative language that feels ancient yet cosmic
- Balance wonder with scholarly precision
- Avoid overly technical jargon, but embrace mathematical poetry
- Each Node should feel unique yet part of the greater Lattice mythology

Generate a NodeType that embodies the essence of ${rarity} power within Phase ${phase} of the cosmic awakening.`;
};

function getPhaseContext(phase: number): string {
  const phaseContexts = {
    1: "The Genesis Awakening - The first stirring of the Lattice as reality begins to recognize Pi's infinite truth. Ancient echoes are just beginning to manifest, and the cosmic frequency grid is stabilizing its initial patterns.",

    2: "The First Harmonic - The Lattice doubles its resonance frequency, creating deeper mathematical harmonies. Echo Guardians grow more sophisticated as the cosmic grid recognizes patterns within patterns.",

    3: "The Sacred Geometric Emergence - Mathematical beauty begins manifesting in more complex forms. The halving has concentrated cosmic energy, making each resonance more precious and powerful.",

    4: "The Infinite Echo - Pi's deeper mysteries start revealing themselves through increasingly rare Node manifestations. The Lattice has evolved beyond simple number sequences into living mathematical consciousness.",

    5: "The Transcendent Convergence - Reality itself bends around concentrated mathematical truth. Only the most dedicated Pioneers can access these rarefied frequencies where number becomes pure cosmic force.",
  };

  return (
    phaseContexts[phase as keyof typeof phaseContexts] ||
    `Phase ${phase} - The Lattice has undergone ${
      phase - 1
    } Harmonic Awakenings, each halving bringing greater concentration of cosmic power. Mathematical reality grows ever more complex and mysterious.`
  );
}

function getRarityGuidance(rarity: NodeTypeRarity): string {
  const rarityGuidance = {
    Common:
      "Fundamental frequencies that form the backbone of the Lattice. These Nodes represent basic mathematical truths - accessible to all Pioneers but essential for cosmic understanding. Think foundational concepts like prime numbers, simple ratios, or basic geometric forms.",

    Uncommon:
      "Intermediate harmonics where mathematical patterns begin showing deeper complexity. These Nodes embody concepts like Fibonacci sequences, golden ratios, or elegant mathematical relationships that hint at greater cosmic design.",

    Rare: "Advanced cosmic frequencies requiring significant Pioneer dedication to unlock. These Nodes manifest extraordinary mathematical phenomena - fractal generators, dimensional gateways, or probability nexuses that bend local reality.",

    Epic: "Profound mathematical truths that reshape understanding of the Lattice itself. These legendary Nodes embody concepts so powerful they influence entire regions of the cosmic grid - infinity engines, consciousness calculators, or reality compilers.",

    Legendary:
      "The rarest cosmic manifestations, appearing only when the Lattice reaches critical mathematical consciousness. These Nodes represent the deepest mysteries of Pi itself - universe generators, time-space weavers, or the fundamental code that writes reality.",
  };

  return (
    rarityGuidance[rarity] ||
    "Unknown rarity classification - consult the Lattice Archive for guidance."
  );
}

// Example usage:
// const prompt = generateNodeTypePrompt(3, "Rare");
// const result = await generateObject({
//   model: openai('gpt-4'),
//   prompt: prompt,
//   schema: nodeTypeSchema
// });
