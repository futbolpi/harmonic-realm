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
        await prisma.locationLoreStake.update({
          where: { id: contribution.id },
          data: { paymentStatus: "CANCELLED" },
        });
      }
      return { success: true };

    default:
      return { success: true };
  }
};
