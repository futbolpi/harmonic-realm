import { Decimal } from "@prisma/client/runtime/library";

import {
  ContributionTier,
  NodeTypeRarity,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";

// lib/types/lore.ts
export interface LocationLore {
  id: string;
  nodeId: string;
  country: string | null;
  state: string | null;
  city: string | null;
  basicHistory: string | null;
  culturalSignificance: string | null;
  mysticInterpretation: string | null;
  epicNarrative: string | null;
  legendaryTale: string | null;
  cosmeticThemes: {
    primaryColors: string[];
    secondaryColors: string[];
    effects: string[];
    ambientSounds: string[];
  } | null;
  audioThemes: {
    baseFrequency: number;
    harmonics: number[];
    instruments: string[];
  } | null;
  currentLevel: number;
  totalPiStaked: Decimal; // Decimal as string for precision
  generationStatus: string;
  node: {
    type: { rarity: NodeTypeRarity; id: string; name: string };
    latitude: number;
    longitude: number;
  };
  stakes: {
    paymentStatus: PaymentStatus;
    piAmount: Decimal;
    contributionTier: ContributionTier | null;
    user: {
      id: string;
      username: string;
    };
  }[];
}

export async function getLore(nodeId: string): Promise<LocationLore | null> {
  // Mocked data - in prod, query DB (e.g., Prisma) and return null for non-existent nodes
  const locationLore = await prisma.locationLore.findUnique({
    where: { nodeId },
    select: {
      id: true,
      nodeId: true,
      legendaryTale: true,
      currentLevel: true,
      totalPiStaked: true,
      generationStatus: true,
      country: true,
      state: true,
      city: true,
      basicHistory: true,
      culturalSignificance: true,
      mysticInterpretation: true,
      epicNarrative: true,
      cosmeticThemes: true,
      audioThemes: true,
      node: {
        select: {
          latitude: true,
          longitude: true,
          type: { select: { id: true, name: true, rarity: true } },
        },
      },
      stakes: {
        where: { paymentStatus: "COMPLETED" },
        select: {
          piAmount: true,
          paymentStatus: true,
          contributionTier: true,
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  return locationLore;
}
