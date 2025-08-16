import { generateObject } from "ai";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { siteConfig } from "@/config/site";
import { NodeTypeRarity } from "../generated/prisma/enums";
import { redis } from "../redis";
import { model } from "../utils/ai";
import { NodeTypeCreateManyInput } from "../generated/prisma/models";

const nodeTypeSchema = z.object({
  description: z.string(),
  extendedLore: z.string().nullable(),
  iconography: z.string().min(1),
});

interface GenerateParams {
  cellId: string;
  rarity: NodeTypeRarity;
  count: number;
  echoIntensity: number;
  phase?: number;
}

export async function generateNodeTypes(
  params: GenerateParams
): Promise<NodeTypeCreateManyInput[]> {
  // region = cellid
  const { cellId, rarity, count, phase, echoIntensity } = params;
  if (count <= 0) return [];

  const cacheKey = `nodetype:${cellId}:${rarity}:${phase ?? "none"}`;
  try {
    const cached = await redis.get<NodeTypeCreateManyInput[]>(cacheKey);
    if (cached && cached.length >= count) return cached.slice(0, count);
  } catch (err) {
    console.error("Redis cache error:", err);
  }

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

  const descriptionLength = {
    Common: "20-50",
    Uncommon: "50-100",
    Rare: "100-200",
    Epic: "200-300",
    Legendary: "300-500",
  }[rarity];
  const phaseMessage = phase !== undefined ? `and phase ${phase}` : "";
  const systemPrompt = `You are a master storyteller in the ${siteConfig.name} universe, weaving cosmic myths and adventures that captivate players with vivid imagery, ancient legends, and calls to heroic deeds. Ensure every narrative is immersive, tying into Pi's blockchain essence and regional lore.`;
  const userPrompt = `
Generate ${count} NodeType objects for the ${siteConfig.name} game found in region "${cellId}" with rarity "${rarity}" ${phaseMessage}:
- Iconography: Choose an emoji or short label (e.g., "🏞️" for Common, "🌌" for Legendary)
- Description: Write an engaging, immersive story snippet (${descriptionLength} characters) with cosmic Pi themes, myths, and player hooks (e.g., "Venture into the void where ancient Pi guardians await your claim!").
- Extended Lore: Optional epic extension (200-500 chars) building on description with deeper narratives, twists, and calls to adventure.

Return an array of objects matching the NodeType schema. Ensure lores are vivid, story-driven, and engaging to draw players in.
  `;

  try {
    const { object: nodeTypes } = await generateObject({
      model,
      schema: nodeTypeSchema,
      output: "array",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7, // For creativity
    });

    const enriched: NodeTypeCreateManyInput[] = nodeTypes.map((nt, i) => ({
      id: uuidv4(),
      name: `${cellId}_${rarity}_${i + 1}`,
      baseYieldPerMinute: yieldMap[rarity],
      lockInMinutes: lockInMap[rarity],
      maxMiners: minersMap[rarity],
      rarity,
      echoIntensity,
      iconUrl: nt.iconography,
      description: nt.description,
      extendedLore: nt.extendedLore,
      phase,
      cellId,
    }));
    await redis.set(cacheKey, enriched, { ex: 86400 });
    return enriched.slice(0, count);
  } catch (error) {
    console.error(`Generation failed for ${cellId}, ${rarity}:`, error);
    throw new Error("NodeType generation error");
  }
}
