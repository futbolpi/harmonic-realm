import { NodeTypeRarity } from "@/lib/generated/prisma/enums";

// lib/types/lore.ts
export interface LocationLore {
  id: string;
  nodeId: string;
  country?: string;
  state?: string;
  city?: string;
  basicHistory?: string;
  culturalSignificance?: string;
  mysticInterpretation?: string;
  epicNarrative?: string;
  legendaryTale: string | null;
  cosmeticThemes?: {
    primaryColors: string[];
    secondaryColors: string[];
    effects: string[];
    ambientSounds: string[];
  };
  audioThemes?: {
    baseFrequency: number;
    harmonics: number[];
    instruments: string[];
  };
  currentLevel: number;
  totalPiStaked: string; // Decimal as string for precision
  generationStatus: string;
  node: {
    rarity: NodeTypeRarity;
    type: string;
    lat: number;
    long: number;
    distance: number;
  };
  contributors: Array<{
    username: string;
    tier: string;
    avatar: string;
  }>;
}

export async function getLore(nodeId: string): Promise<LocationLore | null> {
  // Mocked data - in prod, query DB (e.g., Prisma) and return null for non-existent nodes
  if (nodeId === "47") {
    // Simulate non-existent node
    return null;
  }

  // Mocked data for nodeId '47' (Stonehenge example)
  return {
    id: `lore-${nodeId}`,
    nodeId,
    country: "United Kingdom",
    state: "Wiltshire",
    city: "Amesbury",
    basicHistory:
      "Archaeological evidence suggests this location was significant to ancient civilizations, with structures dating back to 3000 BCE.",
    culturalSignificance:
      "Cultural legends tell of druidic rituals and astronomical alignments, serving as a ceremonial site for millennia.",
    mysticInterpretation:
      "The Lattice recognizes this as a Temporal Anchor where ancient Druids first sensed Pi's infinite rhythm, binding stone to cosmic frequencies.",
    epicNarrative:
      "Here stands the Great Circle of Infinite Resonance, where mortal minds first touched the eternal mathematics that bind reality, echoing through the digits of Pi.",
    legendaryTale: null, // Locked at level 4 for mock
    cosmeticThemes: {
      primaryColors: ["#228B22", "#32CD32", "#006400"],
      secondaryColors: ["#F5F5DC", "#E6E6FA", "#F0F8FF"],
      effects: ["particle-glow", "nature-spirits", "ancient-growth"],
      ambientSounds: ["forest-ambience", "wind-through-trees"],
    },
    audioThemes: {
      baseFrequency: 432,
      harmonics: [648, 864, 1080],
      instruments: ["flute", "nature-sounds", "harmonic-drone"],
    },
    currentLevel: 3, // Mock: Levels 1-3 unlocked
    totalPiStaked: "8.5",
    generationStatus: "COMPLETE",
    node: {
      // Extended mock for node info
      rarity: "Epic",
      type: "Temporal Anchor",
      lat: 51.1789,
      long: -1.8262,
      distance: 2, // km from user (mock)
    },
    contributors: [
      // Mock contributors for spotlight
      {
        username: "PioneerX",
        tier: "Lattice Architect",
        avatar: "/avatars/pioneerx.png",
      },
      {
        username: "EchoFan",
        tier: "Resonance Patron",
        avatar: "/avatars/echofan.png",
      },
    ],
  };
}
