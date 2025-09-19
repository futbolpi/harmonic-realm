import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { env } from "@/env";

export const xaiModel = xai("grok-3");

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const zai = "z-ai/glm-4.5-air:free";
const qwen3 = "qwen/qwen3-coder:free";
const moonshotai = "moonshotai/kimi-k2:free";
const tngtech = "tngtech/deepseek-r1t2-chimera:free";
const openRouterModels = { zai, qwen3, moonshotai, tngtech };

export const openrouterModel = openrouter(openRouterModels.moonshotai);

export const model = env.NODE_ENV === "production" ? xaiModel : openrouterModel;
