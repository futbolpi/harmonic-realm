import { generateObject } from "ai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { siteConfig } from "@/config/site";
import { NodeTypeRarity } from "../generated/prisma/enums";
import { model } from "../utils/ai";
import { NodeTypeCreateManyInput } from "../generated/prisma/models";
import { generateLore } from "./generate-lore";
import { getNumberOfPhaseNodes, PIONEERSCALE } from "./quota";

type Lore = {
  name: string;
  lore: string;
  extendedLore: string;
  iconography?: string;
};

// Base constants (tunable)
const BASE_LOCK_IN = 2; // Minutes
const BASE_YIELD = 10; // Shares/min
const BASE_MINERS = 50; // Slots

// Get lockInMinute
function getLockInMinute(rarity: NodeTypeRarity, phase: number): number {
  const rarityIndex =
    ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].indexOf(rarity) + 1;
  const phaseFactor = 1 + (phase - 1) * 0.2;
  return Math.round(BASE_LOCK_IN * rarityIndex * phaseFactor);
}

// Get baseYieldPerMinute
function getBaseYieldPerMinute(rarity: NodeTypeRarity, phase: number): number {
  const rarityIndex =
    ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].indexOf(rarity) + 1;
  const rarityMultiplier = 1 + Math.log2(rarityIndex + 1) * 10; // Log-scaled ~1 to ~50
  const phaseHalving = Math.pow(2, phase - 1);
  return (BASE_YIELD * rarityMultiplier) / phaseHalving;
}

// Get maxMiners (async for pioneers fetch)
function getMaxMiners(rarity: NodeTypeRarity, phase: number): number {
  const rarityIndex =
    ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].indexOf(rarity) + 1;
  // From formula
  const totalNodes = getNumberOfPhaseNodes(phase);

  return Math.max(
    1,
    Math.floor(BASE_MINERS * (totalNodes / rarityIndex) * PIONEERSCALE)
  ); // Min 1 slot
}

const nodeTypeSchema = z.object({
  name: z.string(),
  lore: z.string(),
  extendedLore: z.string(),
  iconography: z.string(),
});

interface GenerateParams {
  rarity: NodeTypeRarity;
  phase: number;
}

/**
 * Returns the system and user prompts for Vercel AI SDK object generation,
 * tailored to HarmonicRealm’s lore and mechanics.
 *
 * @param phase   – Current Harmonic Awakening phase (e.g. 1, 2)
 * @param  rarity  – NodeType rarity tier ("Common", "Uncommon", "Rare", "Epic", "Legendary")
 * @returns prompts
 */
function createNodeTypePrompts(phase: number, rarity: NodeTypeRarity) {
  const systemPrompt = `
You are ${siteConfig.name}’s AI Lore Artisan. Your task is to craft metadata for a NodeType, a cosmic Pi-frequency beacon seeded on the Lattice. Each NodeType name, lore snippet, extendedLore, and iconography must align with its rarity tier and the current Harmonic Awakening phase.

Requirements:
- Use these game terms: Pioneer, Harmonizer, Lattice, resonance, Echo Guardian, Pi, cosmic frequency grid.
- Rarity tiers: Common (grounded, subtle hum), Uncommon (gentle pulse), Rare (clear resonance), Epic (throbbing echo), Legendary (celestial chorus).
- Phases denote global halving events and new node phenomena; weave phase flavor into the narrative.
- Output a valid JSON object with exactly these keys:
  • name: concise, evocative title  
  • lore: 1–2 sentences describing the node’s immediate significance  
  • extendedLore: 2–3 paragraphs of deeper myth, referencing Pi, Lattice, echoes, phase-specific lore and calls to adventure.
  • iconography:Choose an emoji or short label (e.g., "🏞️" for Common, "🌌" for Legendary)  

Do not include any extra fields, markdown, or commentary—only the object.
`.trim();

  const userPrompt = `
Phase: ${phase}
Rarity: ${rarity}

Generate the NodeType metadata accordingly.
`.trim();

  return { systemPrompt, userPrompt };
}

async function getNodeTypeLore(params: GenerateParams): Promise<Lore> {
  // region = cellid
  const { rarity, phase } = params;
  const { systemPrompt, userPrompt } = createNodeTypePrompts(phase, rarity);

  try {
    const { object: nodeType } = await generateObject({
      model,
      schema: nodeTypeSchema,
      output: "object",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // For creativity
    });
    return nodeType;
  } catch {
    return generateLore(rarity, phase);
  }
}

async function generateNodeType(
  params: GenerateParams
): Promise<NodeTypeCreateManyInput> {
  const { rarity, phase } = params;

  const { extendedLore, lore, name, iconography } = await getNodeTypeLore(
    params
  );

  const enriched: NodeTypeCreateManyInput = {
    id: uuidv4(),
    name,
    baseYieldPerMinute: getBaseYieldPerMinute(rarity, phase),
    lockInMinutes: getLockInMinute(rarity, phase),
    maxMiners: getMaxMiners(rarity, phase),
    rarity,
    iconUrl: iconography,
    description: lore,
    extendedLore,
    phase,
  };
  return enriched;
}

// Generate NodeTypes (one per rarity, with UUID and lockInMinute)
export async function generateNodeTypes(
  phaseId: number
): Promise<NodeTypeCreateManyInput[]> {
  const rarities: NodeTypeRarity[] = [
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  const nodeTypes: NodeTypeCreateManyInput[] = await Promise.all(
    rarities.map((rarity) => generateNodeType({ rarity, phase: phaseId }))
  );

  return nodeTypes;
}
