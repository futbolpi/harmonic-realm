import { generateObject } from "ai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { siteConfig } from "@/config/site";
import { NodeTypeRarity } from "../generated/prisma/enums";
import { model } from "../utils/ai";
import { NodeTypeCreateManyInput } from "../generated/prisma/models";
import { generateLore } from "./generate-lore";

type Lore = {
  name: string;
  lore: string;
  extendedLore: string;
  iconography?: string;
};

const lockInMap: Record<NodeTypeRarity, number> = {
  Common: 6,
  Uncommon: 12,
  Rare: 36,
  Epic: 72,
  Legendary: 144,
};
const yieldMap: Record<NodeTypeRarity, number> = {
  Common: 10,
  Uncommon: 50,
  Rare: 200,
  Epic: 1000,
  Legendary: 5000,
};
const minersMap: Record<NodeTypeRarity, number> = {
  Common: 50,
  Uncommon: 200,
  Rare: 500,
  Epic: 1000,
  Legendary: 2000,
};

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
    const { name, lore, extendedLore } = generateLore(rarity, phase);
    return { name, lore, extendedLore };
  }
}

async function generateNodeType(
  params: GenerateParams
): Promise<NodeTypeCreateManyInput> {
  // region = cellid
  const { rarity, phase } = params;
  const baseYield = 1.0 / phase;

  const { extendedLore, lore, name, iconography } = await getNodeTypeLore(
    params
  );

  const enriched: NodeTypeCreateManyInput = {
    id: uuidv4(),
    name,
    baseYieldPerMinute: yieldMap[rarity] * baseYield,
    lockInMinutes: lockInMap[rarity],
    maxMiners: minersMap[rarity],
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
