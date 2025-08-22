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

async function getNodeTypeLore(params: GenerateParams): Promise<Lore> {
  // region = cellid
  const { rarity, phase } = params;

  const descriptionLength = {
    Common: "20-50",
    Uncommon: "30-70",
    Rare: "50-100",
    Epic: "100-200",
    Legendary: "150-300",
  }[rarity];

  const systemPrompt = `You are a master storyteller in the ${siteConfig.name} universe, weaving cosmic myths and adventures that captivate players with vivid imagery, ancient legends, and calls to heroic deeds. Ensure every narrative is immersive, tying into Pi's blockchain essence and regional lore.`;
  const userPrompt = `
Generate a NodeType object for the ${siteConfig.name} game with rarity "${rarity}" and phase ${phase}:
- Name: NodeType name
- Iconography: Choose an emoji or short label (e.g., "🏞️" for Common, "🌌" for Legendary)
- Lore: Write an engaging, immersive story snippet (${descriptionLength} characters) with cosmic Pi themes, myths, and player hooks (e.g., "Venture into the void where ancient Pi guardians await your claim!").
- Extended Lore: epic extension (200-500 chars) building on description with deeper narratives, twists, and calls to adventure.

Return an object matching the NodeType schema. Ensure lores are vivid, story-driven, and engaging to draw players in.
  `;

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
