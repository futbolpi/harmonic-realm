import { inngest } from "@/inngest/client";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { generateNodeTypes } from "@/lib/node-spawn/generate-node-type";
import { triggerNetworkAwakening } from "@/lib/node-spawn/network-awakening";
import { spawnNodes } from "@/lib/node-spawn/node-spawner";
import { calculatePhaseThreshold } from "@/lib/node-spawn/phase-threshold";
import { calculateNodeQuotas } from "@/lib/node-spawn/quota";
import { generateRegionMetrics } from "@/lib/node-spawn/region-metrics";
import prisma from "@/lib/prisma";

export const nodeSpawnWorkflow = inngest.createFunction(
  {
    id: "node-spawn-workflow",
    retries: 3,
    concurrency: { limit: 10 }, // Best practice: Concurrency limit
    // throttle: { limit: 20, period: "1m" }, // Optional: Rate limit for safety
  },
  { event: "node.spawn.request" },
  async ({ event, step }) => {
    const {
      totalPioneers,
      targetRegion,
      spawnTime,
      gameEventType,
      loreBoost,
      phase,
      layers = [],
    } = event.data;

    if (!totalPioneers || totalPioneers <= 0)
      throw new Error("Invalid totalPioneers");

    if (phase && phase < 1) throw new Error("Invalid phase");

    // Verify threshold (redundant check for safety)
    if (gameEventType === "THRESHOLD" && phase) {
      await step.run("calculate-threshold", async () => {
        const thresh = calculatePhaseThreshold(phase);
        const totalSessions = await prisma.miningSession.count({
          where: { status: "COMPLETED" },
        });
        if (totalSessions < thresh)
          throw new Error(`Threshold not met: ${totalSessions} < ${thresh}`);
        return thresh;
      });
    }

    let regions = await step.run("generate-regions", async () => {
      return generateRegionMetrics(totalPioneers, phase || 1, layers);
    });

    if (targetRegion)
      regions = regions.filter((r) => r.cellId === targetRegion);

    if (spawnTime) await step.sleepUntil("wait-for-time", new Date(spawnTime));

    const quotas = await step.run(
      "calculate-quotas",
      async () => await calculateNodeQuotas(regions)
    );

    const nodeTypesPromises = quotas.flatMap((quota) =>
      Object.entries(quota.rarityDistribution).map(([rarity, count]) =>
        step.run(`generate-node-type-${rarity}-${quota.cellId}`, async () => {
          if (count === 0) return [];
          return await generateNodeTypes({
            cellId: quota.cellId,
            rarity: rarity as NodeTypeRarity,
            count,
            phase,
            echoIntensity:
              regions.find((r) => r.cellId === quota.cellId)?.echoIntensity ||
              1.0,
          });
        })
      )
    );
    const nodeTypes = (await Promise.all(nodeTypesPromises)).flat();

    const nodesPromises = nodeTypes.map((nodeType) =>
      step.run(`spawn-nodes-${nodeType.id}`, async () => {
        const quota = quotas.find((q) => q.cellId === nodeType.cellId);
        const count = quota?.rarityDistribution[nodeType.rarity] || 0;
        const bounds = regions.find(
          (r) => r.cellId === nodeType.cellId
        )?.bounds;
        if (!bounds) throw new Error("Bounds not found");
        return await spawnNodes({ nodeType, count, bounds });
      })
    );
    const nodes = (await Promise.all(nodesPromises)).flat();

    // let nodetype and node returned be shape of create many objects
    const storedNodeTypes = await step.run(
      "persist-node-types-to-db",
      async () => {
        return prisma.nodeType.createMany({
          data: nodeTypes,
          skipDuplicates: true,
        });
      }
    );

    const storedNodes = await step.run("persist-to-db", async () => {
      return prisma.node.createMany({
        data: nodes,
        skipDuplicates: true,
      });
    });

    const narrativeNodes = nodes.map(({ name, lore }) => ({ name, lore }));

    const narrative = await step.run(
      "trigger-awakening",
      async () =>
        await triggerNetworkAwakening(narrativeNodes, targetRegion || "global")
    );

    if (loreBoost) {
      await inngest.send({
        name: "lore.boost",
        data: {
          region: targetRegion || "global",
          rarity: NodeTypeRarity.Epic,
          storyTheme: "cosmic expansion",
        },
      });
    }

    return {
      nodesSpawned: nodes.length,
      narrative,
      storedNodeTypes,
      storedNodes,
    };
  }
);
