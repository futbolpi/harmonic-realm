import prisma from "@/lib/prisma";
import { type Node } from "@/lib/schema/node";

export async function getNodes(): Promise<Node[]> {
  const nodes = await prisma.node.findMany({
    where: { openForMining: true },
    select: {
      id: true,
      latitude: true,
      name: true,
      longitude: true,
      openForMining: true,
      sponsor: true,
      sessions: {
        select: {
          id: true,
          minerSharesEarned: true,
          status: true,
          startTime: true,
          nodeId: true,
          user: { select: { username: true } },
          node: {
            select: {
              type: { select: { name: true, lockInMinutes: true } },
              latitude: true,
              longitude: true,
              echoIntensity: true,
              name: true,
            },
          },
          endTime: true,
        },
        where: { status: "COMPLETED", endTime: { not: null } },
      },
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
      name: true,
      longitude: true,
      openForMining: true,
      sponsor: true,
      sessions: {
        select: {
          id: true,
          minerSharesEarned: true,
          status: true,
          startTime: true,
          nodeId: true,
          user: { select: { username: true } },
          node: {
            select: {
              type: { select: { name: true, lockInMinutes: true } },
              latitude: true,
              longitude: true,
              echoIntensity: true,
              name: true,
            },
          },
          endTime: true,
        },
        where: { status: "COMPLETED", endTime: { not: null } },
      },
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
