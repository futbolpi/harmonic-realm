import { Decimal } from "@prisma/client/runtime/library";

import { NodeTypeRarity } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

type NodeLoreData = {
  id: string;
  name: string;
  type: {
    name: string;
    rarity: NodeTypeRarity;
    description: string;
  };
  latitude: number;
  longitude: number;
  locationLore: {
    currentLevel: number;
    totalPiStaked: Decimal;
    basicHistory: string | null;
    culturalSignificance: string | null;
    cosmeticThemes: {
      primaryColors: string[];
      effects: string[];
    } | null;
    country: string | null;
    state: string | null;
    city: string | null;
  } | null;
};

export const getNodeLore = async (
  nodeId: string
): Promise<NodeLoreData | null> => {
  const nodeLore = await prisma.node.findUnique({
    where: { id: nodeId },
    select: {
      id: true,
      name: true,
      type: { select: { name: true, rarity: true, description: true } },
      latitude: true,
      longitude: true,
      locationLore: {
        select: {
          currentLevel: true,
          totalPiStaked: true,
          basicHistory: true,
          culturalSignificance: true,
          cosmeticThemes: true,
          city: true,
          country: true,
          state: true,
        },
      },
    },
  });
  return nodeLore;
};
