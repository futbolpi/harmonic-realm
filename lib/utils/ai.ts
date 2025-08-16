import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { env } from "@/env";
import { siteConfig } from "@/config/site";

const xaiModel = xai("grok-3");

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const openrouterModel = openrouter("google/gemini-2.0-flash-exp:free");

export const model =
  siteConfig.network === "mainnet" ? xaiModel : openrouterModel;
