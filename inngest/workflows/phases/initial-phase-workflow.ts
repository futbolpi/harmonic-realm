import { inngest } from "@/inngest/client";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { generateNodeTypes } from "@/lib/node-spawn/generate-node-type";
import { triggerNetworkAwakening } from "@/lib/node-spawn/network-awakening";
import { generateNodes } from "@/lib/node-spawn/node-generator";
import { getNumberOfPhaseNodes } from "@/lib/node-spawn/quota";
import prisma from "@/lib/prisma";

// Initial Genesis phase
export const generateInitialPhase = inngest.createFunction(
  { id: "generate-initial-phase" },
  { event: "phase/generate.initial" },
  async ({ step }) => {
    const phaseNumber = 1;

    // Step 1: Calculate no of nodes (depends on total number of kyced pioneers)
    const totalNodes = await step.run("calculate-no-of-nodes", async () =>
      getNumberOfPhaseNodes(phaseNumber)
    );

    // Step 2: Create genesis phase
    const phase = await step.run("create-genesis-phase", async () => {
      return prisma.gamePhase.create({
        data: {
          phaseNumber,
          triggerType: "GENESIS",
          loreNarrative: "",
          halvingFactor: 1.0,
          totalNodes,
        },
      });
    });

    // Step 3: Generate and store NodeTypes (small, one step)
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

    // Prepare rarityToIdMap from nodeTypes
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

    // Step 5: Batch generate and store nodes
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
            adaptive: false,
            rarityToIdMap,
            batch,
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

    // Step 6: update game phase narrative.
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

    // Step 7: Notify ecosystem of genesis completion
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
