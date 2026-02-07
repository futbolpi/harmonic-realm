import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";

export async function stabilizeSurgeNode(nodeId: string, username: string) {
  await prisma.$transaction([
    // Convert node to permanent Awakening type
    prisma.node.update({
      where: { id: nodeId },
      data: { genEvent: "SurgeStabilized" }, // NEW enum value
      select: { id: true },
    }),

    // Mark Surge record as stabilized
    prisma.resonanceSurge.update({
      where: { nodeId },
      data: {
        isStabilized: true,
        stabilizedAt: new Date(),
        stabilizedBy: username,
      },
      select: { nodeId: true },
    }),
  ]);

  // Send Herald notification
  await inngest.send({
    name: "cosmic-herald-announcement",
    data: {
      content: `🌟 Surge Node Stabilized! Pioneer @${username} anchored a Resonance Surge, creating permanent content for the Lattice.`,
      messageType: "announcement",
    },
  });
}
