import Decimal from "decimal.js";

import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import {
  calculateActivityScore,
  calculateFundingScale,
  calculateNodeSpawn,
  calculatePiCost,
} from "@/lib/calibration";
import { getBinId } from "@/lib/node-spawn/region-metrics";
import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import { generateNodes } from "@/lib/node-spawn/node-generator";

/**
 * Inngest Workflow: Lattice Calibration Triggered
 *
 * This workflow is triggered when the community reaches the required Pi funding threshold.
 * It generates new rare nodes and distributes them based on community activity.
 */
export const calibrationTriggeredWorkflow = inngest.createFunction(
  { id: "calibration-triggered" },
  { event: "calibration/triggered" },
  async ({ event, step }) => {
    const { gamePhaseId } = event.data;

    // Step 1: Fetch game phase and contributions
    const gamePhase = await step.run("fetch-game-phase", async () => {
      return await prisma.gamePhase.findUnique({
        where: { id: gamePhaseId },
        select: {
          requiredPiFunding: true,
          id: true,
          phaseNumber: true,
          piDigitsIndex: true,
        },
      });
    });

    if (!gamePhase) {
      throw new Error(`Game phase ${gamePhaseId} not found`);
    }

    // Step 2: Fetch all contributions for this phase
    const contributions = await step.run("fetch-contributions", async () => {
      return await prisma.awakeningContribution.findMany({
        where: { gamePhaseId, paymentStatus: "COMPLETED" },
        select: {
          latitudeBin: true,
          longitudeBin: true,
          id: true,
          contributionTier: true,
          piContributed: true,
        },
      });
    });

    // Step 3: Calculate activity score (stub values for now)
    const activityScore = await step.run(
      "calculate-activity-score",
      async () => {
        // TODO: Replace with actual metrics from your system
        const miningIntensity = 3.77; // Stub value
        const nodeUtilization = 75; // Stub value
        return calculateActivityScore(miningIntensity, nodeUtilization);
      }
    );

    // Step 4: Calculate funding scale
    const fundingScale = await step.run("calculate-funding-scale", async () => {
      return calculateFundingScale(
        new Decimal(gamePhase.requiredPiFunding.toString())
      );
    });

    // Step 5: Calculate number of nodes to spawn
    const currentBatchSize = await step.run(
      "calculate-node-spawn",
      async () => {
        return calculateNodeSpawn(activityScore, fundingScale, 100);
      }
    );

    // Step 6: get the node types for the current phase
    const nodeTypes = await step.run(
      "get-current-phase-node-types",
      async () => {
        return prisma.nodeType.findMany({
          where: { phase: gamePhase.phaseNumber },
          select: { id: true, rarity: true },
        });
      }
    );

    // Step 7: Identify high-resonance areas
    const highResonanceAreas = await step.run(
      "identify-high-resonance-areas",
      async () => {
        // Aggregate contributions by binned location
        const aggregated = new Map<
          string,
          { binId: string; activity: number }
        >();

        for (const contribution of contributions) {
          const key = getBinId(
            contribution.latitudeBin,
            contribution.longitudeBin
          );
          const existing = aggregated.get(key);
          const amt = new Decimal(contribution.piContributed.toString());

          if (existing) {
            existing.activity = existing.activity + amt.toNumber();
            aggregated.set(key, existing);
          } else {
            aggregated.set(key, {
              activity: amt.toNumber(),
              binId: key,
            });
          }
        }

        // Sort by contribution count and return top areas
        return Array.from(aggregated.values()).sort(
          (a, b) => b.activity - a.activity
        );
      }
    );

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

    const batch = 20 + gamePhase.piDigitsIndex;

    // Step 8: Batch generate and store nodes (adaptive)
    const batchNodes = await step.run("generate-node-locations", async () => {
      return generateNodes({
        phaseId: gamePhase.phaseNumber,
        currentBatchSize,
        adaptive: true,
        batch,
        binActivities: highResonanceAreas,
        rarityToIdMap,
      });
    });

    // Step 9: Create nodes in database
    const createdNodes = await step.run("create-nodes", async () => {
      const nodes = await prisma.node.createMany({
        data: batchNodes,
        skipDuplicates: true,
      });
      return nodes;
    });

    // Step 10: Reset phase and advance index
    const phaseReset = await step.run("reset-phase-and-advance", async () => {
      const newIndex = gamePhase.piDigitsIndex + 1;
      const newRequiredFunding = calculatePiCost(newIndex);

      return await prisma.gamePhase.update({
        where: { id: gamePhaseId },
        data: {
          currentProgress: new Decimal(0),
          piDigitsIndex: newIndex,
          requiredPiFunding: newRequiredFunding,
          totalNodes: { increment: createdNodes.count },
        },
      });
    });

    // step 11 send notification

    return {
      success: true,
      summary: {
        gamePhaseId,
        nodesCreated: createdNodes.count,
        activityScore,
        fundingScale,
        highResonanceAreasIdentified: highResonanceAreas.length,
        newPhaseIndex: phaseReset.piDigitsIndex,
        newRequiredFunding: phaseReset.requiredPiFunding.toString(),
      },
    };
  }
);
