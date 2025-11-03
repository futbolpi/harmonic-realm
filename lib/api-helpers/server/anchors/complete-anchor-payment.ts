import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import type { ApiResponse } from "@/lib/schema/api";
import type { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import type { NodeCreateManyInput } from "@/lib/generated/prisma/models";
import {
  chooseWeighted,
  generateNodeName,
} from "@/lib/node-spawn/node-generator";
import { generateLore } from "@/lib/node-spawn/generate-lore";

type Params = {
  paymentId: string;
  txid: string;
  anchorId: string;
  amount: number;
};

/**
 * ACTION: Complete Pi Payment, Create Node, increase phase no of nodes,
 * update anchor with node id
 * revalidate anchor detail page and map
 */
export async function completeAnchorPayment({
  paymentId,
  anchorId,
  txid,
  amount,
}: Params): Promise<ApiResponse<undefined>> {
  try {
    // Find the stake record
    const anchor = await prisma.resonantAnchor.findFirst({
      where: {
        id: anchorId,
        paymentId,
        paymentStatus: "PROCESSING",
        piCost: { lte: amount },
      },
      select: {
        phaseId: true,
        locationLat: true,
        locationLon: true,
        phase: { select: { phaseNumber: true } },
      },
    });

    if (!anchor) {
      return {
        success: false,
        error: "Processing anchor not found",
      };
    }

    const [offset, nodeTypes] = await Promise.all([
      prisma.resonantAnchor.count({
        where: { phaseId: anchor.phaseId, paymentStatus: "COMPLETED" },
      }),
      prisma.nodeType.findMany({
        where: { phase: anchor.phase.phaseNumber },
        select: { id: true, rarity: true },
      }),
    ]);

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

    const rarities: NodeTypeRarity[] = [
      "Common",
      "Uncommon",
      "Rare",
      "Epic",
      "Legendary",
    ];
    const probs = [0.5, 0.25, 0.15, 0.09, 0.01];

    const selectedRarity = chooseWeighted(rarities, probs);
    const typeId = rarityToIdMap[selectedRarity];
    const echoIntensity = 1;
    const lore = generateLore(selectedRarity, anchor.phase.phaseNumber).lore;
    const name = generateNodeName(selectedRarity, offset);

    // get node details
    const node: NodeCreateManyInput = {
      name,
      latitude: anchor.locationLat,
      longitude: anchor.locationLon,
      typeId,
      phase: anchor.phase.phaseNumber,
      echoIntensity,
      lore,
      sponsor: anchorId,
    };

    // Create node, Update anchor record, and update phase progress in a transaction
    await prisma.$transaction(async (tx) => {
      // create the node
      const createdNode = await tx.node.create({
        data: node,
        select: { id: true },
      });
      // Update the anchor record
      await tx.resonantAnchor.update({
        data: {
          piTransactionId: txid,
          paymentStatus: "COMPLETED",
          nodeId: createdNode.id,
        },
        where: { id: anchorId },
        select: { id: true },
      });

      // Update game phase number of nodes
      await tx.gamePhase.update({
        where: { id: anchor.phaseId },
        data: {
          totalNodes: { increment: 1 },
        },
        select: { totalNodes: true },
      });
    });

    // Revalidate relevant paths
    revalidatePath(`/resonant-anchors/${anchorId}`);
    revalidatePath(`/resonant-anchors`);

    // send notification

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error completing lore payment:", error);
    return {
      success: false,
      error: "Failed to complete payment",
    };
  }
}
