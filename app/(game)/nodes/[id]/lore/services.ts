import prisma from "@/lib/prisma";

export const getNodeLore = async (nodeId: string) => {
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
          epicNarrative: true,
          legendaryTale: true,
          mysticInterpretation: true,
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
