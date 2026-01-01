import { PaymentType } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/schema/api";

type CancelParams = {
  type: PaymentType;
  modelId: string;
};

export const cancelPayment = async ({
  modelId,
  type,
}: CancelParams): Promise<ApiResponse<undefined>> => {
  switch (type) {
    case "LOCATION_LORE":
      const stake = await prisma.locationLoreStake.findFirst({
        where: { id: modelId },
        select: { id: true },
      });
      if (stake) {
        await prisma.locationLoreStake.update({
          where: { id: stake.id },
          data: { paymentStatus: "CANCELLED" },
        });
      }
      return { success: true };

    case "LATTICE_CALIBRATION":
      const contribution = await prisma.awakeningContribution.findFirst({
        where: { id: modelId },
        select: { id: true },
      });
      if (contribution) {
        await prisma.awakeningContribution.update({
          where: { id: contribution.id },
          data: { paymentStatus: "CANCELLED" },
        });
      }
      return { success: true };

    case "RESONANCE_ANCHOR":
      const anchor = await prisma.resonantAnchor.findFirst({
        where: { id: modelId },
        select: { id: true },
      });
      if (anchor) {
        await prisma.resonantAnchor.update({
          where: { id: anchor.id },
          data: { paymentStatus: "CANCELLED" },
        });
      }
      return { success: true };

    case "GUILD_CREATION":
      const guild = await prisma.guild.findFirst({
        where: { id: modelId },
        select: { id: true },
      });
      if (guild) {
        await prisma.guild.update({
          where: { id: guild.id },
          data: { paymentId: null, piTransactionId: null },
        });
      }
      return { success: true };

    default:
      return { success: false };
  }
};
