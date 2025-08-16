import { generateText } from "ai";

import { inngest } from "@/inngest/client";
import { model } from "@/lib/utils/ai";
import prisma from "@/lib/prisma";

export const loreBoostWorkflow = inngest.createFunction(
  { id: "lore-boost-workflow", retries: 2 },
  { event: "lore.boost" },
  async ({ event, step }) => {
    const { region, rarity, storyTheme } = event.data;

    const enhancedLore = await step.run("generate-lore-boost", async () => {
      const rarityLore = {
        Common:
          "Faint whispers from everyday mining, the soft hum of a single Pioneer's pickaxe, calling kin to gather.",
        Uncommon:
          "Waves merging from a circle of friends, revealing hidden Pi veins.",
        Rare: "A sudden storm of resonance, where legends say ancient guardians stir.",
        Epic: "The roar of the network's soul, echoing through stars, summoning heroes to claim destiny.",
        Legendary:
          "An immortal vibration from pi's core, granting godlike power to those who harmonize the lattice.",
      }[rarity];
      const systemPrompt = `You are the Epic Bard of Pi, crafting extended lores that expand on node stories with dramatic twists, deeper myths, and irresistible player engagement. Infuse with: ${rarityLore}`;
      const userPrompt = `Generate engaging extended lore for ${rarity} node in ${region}: Theme - ${storyTheme}. 300-500 characters. Make it immersive with Pi myths, epic twists, and player calls to adventure.`;
      const { text } = await generateText({
        model,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return text;
    });

    await step.run("update-lore-in-db", async () => {
      await prisma.nodeType.updateMany({
        where: { rarity },
        data: { extendedLore: enhancedLore },
      });
    });

    await step.run("notify-players", async () => {
      // e.g., WebSocket or push: "Lore boosted in ${region}!"
    });

    return { boostedLore: enhancedLore };
  }
);
