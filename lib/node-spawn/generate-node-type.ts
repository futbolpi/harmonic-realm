import { generateObject } from "ai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { NodeTypeRarity } from "../generated/prisma/enums";
import { model } from "../utils/ai";
import { NodeTypeCreateManyInput } from "../generated/prisma/models";
import { generateLore } from "./generate-lore";
import { getNumberOfPhaseNodes, PIONEERSCALE } from "./quota";
import { generateNodeTypePrompt } from "./node-type-prompts";

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

const RARITIES: NodeTypeRarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];

// Get lockInMinute
function getLockInMinute(rarity: NodeTypeRarity, phase: number): number {
  const rarityIndex = RARITIES.indexOf(rarity) + 1;
  const phaseFactor = 1 + (phase - 1) * 0.2;
  return Math.round(BASE_LOCK_IN * rarityIndex * phaseFactor);
}

// Get baseYieldPerMinute
export function getBaseYieldPerMinute(
  rarity: NodeTypeRarity,
  phase: number
): number {
  const rarityIndex = RARITIES.indexOf(rarity) + 1;
  const rarityMultiplier = 1 + Math.log2(rarityIndex + 1) * 10; // Log-scaled ~1 to ~50
  const phaseHalving = Math.pow(2, phase - 1);
  return (BASE_YIELD * rarityMultiplier) / phaseHalving;
}

// Get maxMiners (async for pioneers fetch)
export function getMaxMiners(rarity: NodeTypeRarity, phase: number): number {
  const rarityIndex = RARITIES.indexOf(rarity) + 1;
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

export async function getNodeTypeLore(params: GenerateParams): Promise<Lore> {
  // region = cellid
  const { rarity, phase } = params;
  const prompt = generateNodeTypePrompt(phase, rarity);

  try {
    const { object: nodeType } = await generateObject({
      model,
      schema: nodeTypeSchema,
      prompt,
      temperature: 0.7, // For creativity
    });
    return nodeType;
  } catch (e) {
    console.log(e);
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
