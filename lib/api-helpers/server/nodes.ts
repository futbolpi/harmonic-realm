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
          rarity: true,
        },
      },
    },
  });

  return nodes;
}

export async function getNode(id: string): Promise<Node | null> {
  const node = await prisma.node.findUnique({
    where: { id },
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
          rarity: true,
        },
      },
    },
  });

  return node;
}
