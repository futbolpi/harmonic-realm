import { inngest } from "@/inngest/client";
import { getEffectivePioneersForPhase } from "@/lib/node-spawn/quota";

import { nodeSpawnWorkflow } from "./node-spawn-workflow";
import prisma from "@/lib/prisma";

// Updated genesisWorkflow: Initializes Phase 1 with half nodes equally distributed.
// Uses getEffectivePioneersForPhase for halving logic and invokes nodeSpawnWorkflow.
// Records phase in GamePhase model without adding fields (uses existing: phaseNumber,
// totalNodes, triggerType, threshold, startTime, loreNarrative).
// Sends completion event for UI updates.
export const genesisWorkflow = inngest.createFunction(
  {
    id: "game-genesis-workflow",
    retries: 3,
    concurrency: { limit: 1 }, // Ensure single genesis execution
  },
  { event: "game.genesis.start" },
  async ({ step }) => {
    const phase = 1;

    // Step 1: Calculate effective pioneers (50% for genesis per halving lore)
    const effectivePioneers = await step.run(
      "calculate-effective-pioneers",
      async () => getEffectivePioneersForPhase(phase)
    );

    // Step 2: Spawn nodes via reusable workflow
    const { nodesSpawned, narrative } = await step.invoke(
      "spawn-nodes-genesis",
      {
        function: nodeSpawnWorkflow,
        data: {
          totalPioneers: effectivePioneers,
          loreBoost: true,
          phase,
          layers: ["environmental"], // Apply environmental layer for realism
          gameEventType: "GENESIS",
        },
      }
    );

    // Step 3: Record genesis phase
    await step.run("record-genesis-phase", async () => {
      await prisma.gamePhase.upsert({
        where: { phaseNumber: phase },
        update: {
          totalNodes: nodesSpawned,
          triggerType: "GENESIS",
          threshold: null, // No threshold for genesis
          startTime: new Date(),
          loreNarrative: narrative,
        },
        create: {
          phaseNumber: phase,
          totalNodes: nodesSpawned,
          triggerType: "GENESIS",
          threshold: null,
          startTime: new Date(),
          loreNarrative: narrative,
        },
      });
    });

    // Step 4: Notify ecosystem of genesis completion
    // await inngest.send({
    //   name: "harmonicrealm.phase.completed",
    //   data: { phase, nodesSpawned },
    // });

    return { phase, nodesSpawned, narrative };
  }
);
