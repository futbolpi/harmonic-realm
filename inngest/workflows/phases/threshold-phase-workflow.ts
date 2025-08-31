import { inngest } from "@/inngest/client";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { generateNodeTypes } from "@/lib/node-spawn/generate-node-type";
import { triggerNetworkAwakening } from "@/lib/node-spawn/network-awakening";
import { generateNodes } from "@/lib/node-spawn/node-generator";
import { getNumberOfPhaseNodes } from "@/lib/node-spawn/quota";
import { getBinId } from "@/lib/node-spawn/region-metrics";
import prisma from "@/lib/prisma";
import { halvingFormula } from "@/lib/utils";

// Next phase workflow
export const generateNextPhase = inngest.createFunction(
  { id: "generate-next-phase" },
  { event: "phase/generate.next" },
  async ({ step }) => {
    const prevPhase = await step.run("get-prev-phase", async () => {
      return prisma.gamePhase.findFirst({ orderBy: { phaseNumber: "desc" } });
    });

    if (!prevPhase) {
      return { message: "No previous phase available" };
    }

    const phaseNumber = prevPhase.phaseNumber + 1;
    const halvingFactor = 0.5;

    // Step 1: Calculate no of nodes
    const totalNodes = await step.run("calculate-no-of-nodes", async () =>
      getNumberOfPhaseNodes(phaseNumber)
    );

    // Step 2: Halve yields on existing NodeTypes
    await step.run("halve-yields", async () => {
      await prisma.nodeType.updateMany({
        data: { baseYieldPerMinute: { multiply: halvingFactor } },
      });
    });

    // Step 3: Create new phase
    const phase = await step.run("create-new-phase", async () => {
      return prisma.gamePhase.create({
        data: {
          phaseNumber,
          loreNarrative: "",
          triggerType: "THRESHOLD", // Or dynamic
          halvingFactor: halvingFormula(phaseNumber, 1),
          totalNodes,
        },
      });
    });

    // Step 4: Fetch bin activities from MiningSessions
    const binActivities = await step.run("fetch-bin-activities", async () => {
      const groups = await prisma.miningSession.groupBy({
        by: ["latitudeBin", "longitudeBin"],
        _count: { _all: true },
        where: {
          latitudeBin: { not: null },
          longitudeBin: { not: null },
          status: "COMPLETED",
          endTime: { not: null },
        },
      });
      return groups.map((g) => ({
        binId: getBinId(g.latitudeBin as number, g.longitudeBin as number),
        activity: g._count._all,
      }));
    });

    // Step 5: Generate and store NodeTypes
    const nodeTypes = await step.run("generate-node-types", async () => {
      const types = await generateNodeTypes(phase.phaseNumber); // Assume generateNodeTypes returns array
      return types;
    });

    await step.run("save-node-types", async () => {
      return prisma.nodeType.createMany({
        data: nodeTypes,
        skipDuplicates: true,
      });
    });

    // Prepare rarityToIdMap
    const rarityToIdMap: Record<NodeTypeRarity, string> = {
      Common: "",
      Epic: "",
      Legendary: "",
      Rare: "",
      Uncommon: "",
    };

    nodeTypes.forEach((type) => {
      rarityToIdMap[type.rarity] = type.id;
    });

    // Step 6: Batch generate and store nodes (adaptive)
    const batchSize = 1000;
    const numBatches = Math.ceil(totalNodes / batchSize);
    let remainingNodes = totalNodes;

    for (let batch = 0; batch < numBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, remainingNodes);
      const batchNodes = await step.run(
        `generate-nodes-batch-${batch}`,
        async () => {
          return generateNodes({
            phaseId: phase.phaseNumber,
            currentBatchSize,
            adaptive: true,
            batch,
            binActivities,
            rarityToIdMap,
          });
        }
      );

      await step.run(`store-nodes-batch-${batch}`, async () => {
        await prisma.node.createMany({
          data: batchNodes,
          skipDuplicates: true,
        });
      });

      remainingNodes -= currentBatchSize;
    }

    // Step 7: Update game phase narrative (similar to initial)
    // Note: use the nodetypes this time
    const types = nodeTypes.map((nt) => ({
      name: nt.name,
      lore: nt.description,
    }));

    const loreNarrative = await step.run(
      "trigger-awakening",
      async () =>
        await triggerNetworkAwakening({
          phase: phaseNumber,
          region: "Earth",
          totalNodes,
          types,
        })
    );

    await step.run(
      "update-phase-narrative",
      async () =>
        await prisma.gamePhase.update({
          data: { loreNarrative },
          where: { phaseNumber },
        })
    );

    // Step 8: Notify ecosystem of phase completion
    await inngest.send({
      name: "game.phase.completed",
      data: {
        phase: phase.phaseNumber,
        nodesSpawned: totalNodes,
      },
    });

    return { phase: phase.phaseNumber, totalNodes };
  }
);
