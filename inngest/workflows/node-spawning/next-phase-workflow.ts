import { inngest } from "@/inngest/client";
import { calculatePhaseThreshold } from "@/lib/node-spawn/phase-threshold";
import { getEffectivePioneersForPhase } from "@/lib/node-spawn/quota";
import prisma from "@/lib/prisma";
import { nodeSpawnWorkflow } from "./node-spawn-workflow";

// New nextPhaseWorkflow: Triggers phase >1 when 'game.phase.next' event is sent by completeMiningSession.
// Verifies threshold, spawns halved nodes based on activity, and records phase in GamePhase.
// Uses reusable functions for modularity and Inngest best practices (concurrency=1, steps, retries).

const MAX_PHASES = 6;

export const nextPhaseWorkflow = inngest.createFunction(
  {
    id: "game-next-phase",
    retries: 3,
    concurrency: { limit: 1 }, // Prevent phase transition races
  },
  { event: "game.phase.next" },
  async ({ event, step }) => {
    const { phase } = event.data;

    // Step 1: Validate phase
    await step.run("validate-phase", async () => {
      if (phase <= 1 || phase > MAX_PHASES)
        throw new Error(`Invalid phase: ${phase}`);
    });

    // Step 2: Verify threshold (redundant check for safety)
    const threshold = await step.run("calculate-threshold", async () => {
      const thresh = calculatePhaseThreshold(phase);
      const totalSessions = await prisma.miningSession.count({
        where: { status: "COMPLETED" },
      });
      if (totalSessions < thresh)
        throw new Error(`Threshold not met: ${totalSessions} < ${thresh}`);
      return thresh;
    });

    // Step 3: Calculate effective pioneers (halving per phase)
    const effectivePioneers = await step.run(
      "calculate-effective-pioneers",
      async () => getEffectivePioneersForPhase(phase)
    );

    // Step 4: Spawn nodes via reusable workflow (activity-based for >1)
    const { nodesSpawned, narrative } = await step.invoke("spawn-nodes-phase", {
      function: nodeSpawnWorkflow,
      data: {
        totalPioneers: effectivePioneers,
        loreBoost: true,
        phase,
        layers: ["environmental"],
        gameEventType: "THRESHOLD",
      },
    });

    // Step 5: Record phase in GamePhase
    await step.run("record-phase", async () => {
      await prisma.gamePhase.upsert({
        where: { phaseNumber: phase },
        update: {
          totalNodes: nodesSpawned,
          triggerType: "THRESHOLD",
          threshold,
          startTime: new Date(),
          loreNarrative: narrative,
        },
        create: {
          phaseNumber: phase,
          totalNodes: nodesSpawned,
          triggerType: "THRESHOLD",
          threshold,
          startTime: new Date(),
          loreNarrative: narrative,
        },
      });
    });

    // Step 6: Notify ecosystem of phase completion
    // await inngest.send({
    //   name: "harmonicrealm.phase.completed",
    //   data: { phase, nodesSpawned },
    // });

    return { phase, nodesSpawned, narrative };
  }
);
