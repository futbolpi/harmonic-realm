import prisma from "@/lib/prisma";
import { type Node } from "@/lib/schema/node";

export async function getNodes(): Promise<Node[]> {
  const nodes = await prisma.node.findMany({
    where: { openForMining: true },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      openForMining: true,
      sponsor: true,
      type: {
        select: {
          id: true,
          name: true,
          baseYieldPerMinute: true,
          iconUrl: true,
          maxMiners: true,
          lockInMinutes: true,
          NodeTypeRarity: true,
        },
      },
    },
  });

  return nodes;
}

// Mock server-side node fetching
export async function getNode(id: string): Promise<Node | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock nodes data - in real app, fetch from database
  const nodes = await getNodes();

  return nodes.find((node) => node.id === id) || null;
}
