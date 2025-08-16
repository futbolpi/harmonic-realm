import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { nodeSpawnWorkflow } from "@/inngest/workflows/node-spawning/node-spawn-workflow";
import { genesisWorkflow } from "@/inngest/workflows/node-spawning/genesis-workflow";
import { loreBoostWorkflow } from "@/inngest/workflows/node-spawning/lore-boost-workflow";
import { nextPhaseWorkflow } from "@/inngest/workflows/node-spawning/next-phase-workflow";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    nodeSpawnWorkflow,
    genesisWorkflow,
    loreBoostWorkflow,
    nextPhaseWorkflow,
  ],
});
