import {
  commonAdjectives,
  commonEnvironments,
  commonLoreItems,
  commonNouns,
  epicAdjectives,
  epicEnvironments,
  epicLoreItems,
  epicNouns,
  legendaryAdjectives,
  legendaryEnvironments,
  legendaryLoreItems,
  legendaryNouns,
  rareAdjectives,
  rareEnvironments,
  rareLoreItems,
  rareNouns,
  uncommonAdjectives,
  uncommonEnvironments,
  uncommonLoreItems,
  uncommonNouns,
} from "./lore-items";
import { NodeTypeRarity } from "../generated/prisma/enums";

export function getRarityElements(rarity: NodeTypeRarity): {
  adjectives: string[];
  nouns: string[];
  environments: string[];
  loreItems: string[];
} {
  switch (rarity) {
    case "Common":
      return {
        adjectives: commonAdjectives,
        nouns: commonNouns,
        environments: commonEnvironments,
        loreItems: commonLoreItems,
      };
    case "Uncommon":
      return {
        adjectives: uncommonAdjectives,
        nouns: uncommonNouns,
        environments: uncommonEnvironments,
        loreItems: uncommonLoreItems,
      };
    case "Rare":
      return {
        adjectives: rareAdjectives,
        nouns: rareNouns,
        environments: rareEnvironments,
        loreItems: rareLoreItems,
      };
    case "Epic":
      return {
        adjectives: epicAdjectives,
        nouns: epicNouns,
        environments: epicEnvironments,
        loreItems: epicLoreItems,
      };
    case "Legendary":
      return {
        adjectives: legendaryAdjectives,
        nouns: legendaryNouns,
        environments: legendaryEnvironments,
        loreItems: legendaryLoreItems,
      };
  }
}

// Generate lore with rarity-dependent elements
export function generateLore(
  rarity: NodeTypeRarity,
  phaseNumber: number
): { name: string; lore: string; extendedLore: string } {
  const { adjectives, nouns, environments, loreItems } =
    getRarityElements(rarity);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const env = environments[Math.floor(Math.random() * environments.length)];
  const item = loreItems[Math.floor(Math.random() * loreItems.length)];

  const name = `${adj} ${noun} (Phase ${phaseNumber})`;
  const lore = `A ${adj.toLowerCase()} ${noun.toLowerCase()} resonating in a ${env}, holding ${item}.`;
  let extendedLore = `Born from Pi's digits in Harmonic Awakening ${phaseNumber}, this node echoes guardians' whispers.`;

  if (rarity === "Uncommon") {
    extendedLore += " It hums with subtle power, rewarding early Harmonizers.";
  } else if (rarity === "Rare") {
    extendedLore +=
      " It pulses with moderate cosmic power, yielding shares attuned to Pioneers.";
  } else if (rarity === "Epic") {
    extendedLore +=
      " Legends of the Lattice speak of its immense resonance, guarded by echoes.";
  } else if (rarity === "Legendary") {
    extendedLore +=
      " Ultimate harmony from Pi's depths; only true Harmonizers can master its frequency.";
  } else {
    extendedLore += " A common nexus for mining shares in the Realm.";
  }

  return { name, lore, extendedLore };
}
