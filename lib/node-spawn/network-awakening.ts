import { generateText } from "ai";

import { siteConfig } from "@/config/site";
import { model } from "../utils/ai";

type AwakeningNode = { name: string; lore: string };

export async function triggerNetworkAwakening(
  nodes: AwakeningNode[],
  region: string
): Promise<string> {
  const systemPrompt = `You are the Grand Chronicler of the ${siteConfig.name} Cosmos, a mystical narrator who weaves epic tales of awakening nodes in the Pi Network game. Your stories are rich with cosmic wonder, ancient myths, heroic calls to action, and immersive details that draw players into the adventure. Use vivid language, build tension, and end with an inspiring hook to encourage exploration and mining. Keep narratives 100-200 words, compelling, and tied to Pi's blockchain legacy.`;

  const userPrompt = `
A new batch of ${
    nodes.length
  } nodes has spawned in ${region}! Craft an engaging narrative for a "Network Awakening" event, announcing these nodes to players. Tie it to cosmic Pi themes, myths, and community adventure. Mention a few node names and their lore snippets to spark excitement. Make it immersive and call players to action.
Examples of node details for inspiration:
${nodes
  .slice(0, 3)
  .map((n) => `- ${n.name}: ${n.lore}`)
  .join("\n")}
  `;

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    });
    return text.trim();
  } catch (error) {
    console.error("Awakening narrative failed:", error);
    return `Fallback: Nodes awaken in ${region}! Join the cosmic mining adventure.`;
  }
}
