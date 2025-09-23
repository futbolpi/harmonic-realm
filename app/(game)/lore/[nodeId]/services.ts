import prisma from "@/lib/prisma";

export async function getLore(nodeId: string) {
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
          name: true,
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
