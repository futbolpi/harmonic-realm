import { z } from "zod";
import { generateObject } from "ai";

import { siteConfig } from "@/config/site";
import { model } from "../utils/ai";
import {
  NodeCreateManyInput,
  NodeTypeCreateManyInput,
} from "../generated/prisma/models";

const nodeSchema = z.object({
  name: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  lore: z.string().min(20).max(200),
});

interface SpawnRequest {
  nodeType: NodeTypeCreateManyInput;
  count: number;
  bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number };
}

export async function spawnNodes({
  nodeType,
  count,
  bounds,
}: SpawnRequest): Promise<NodeCreateManyInput[]> {
  if (count <= 0) return [];

  const systemPrompt = `You are a node forger in the ${siteConfig.name} realm, creating concrete nodes with names, random coordinates within bounds and lores that extend the NodeType's story in engaging ways. Make lores short but captivating, with hooks that invite players to mine.`;
  const userPrompt = `
Using this NodeType:
${JSON.stringify(nodeType, null, 2)}

Generate ${count} concrete Nodes within bounds:
- Latitude: ${bounds.latMin} to ${bounds.latMax}
- Longitude: ${bounds.lonMin} to ${bounds.lonMax}

For each:
- Unique name inspired by description/extendedLore.
- Random lat/long in bounds.
- 1-2 sentence engaging lore snippet with hooks.

Return array of objects matching the schema.
  `;

  try {
    const { object: nodes } = await generateObject({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      output: "array",
      schema: nodeSchema,
    });

    return nodes.map((node) => ({
      ...node,
      typeId: nodeType.id,
      echoIntensity: nodeType.echoIntensity,
      phase: nodeType.phase,
    }));
  } catch (error) {
    console.error("Spawn nodes failed:", error);
    throw new Error("Node spawning error");
  }
}
