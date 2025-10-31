import { approveCalibrationPayment } from "@/lib/api-helpers/server/calibration/approve-calibration-payment";
import { approveLocationLorePayment } from "@/lib/api-helpers/server/location-lore/approve-lore-payment";
import { PaymentType } from "@/lib/generated/prisma/enums";
import { ApiResponse } from "@/lib/schema/api";

type ApprovalParams = {
  type: PaymentType;
  amount: number;
  modelId: string;
  paymentId: string;
};

export const verifyPaymentApproval = async ({
  amount,
  modelId,
  type,
  paymentId,
}: ApprovalParams): Promise<ApiResponse<undefined>> => {
  switch (type) {
    case "LOCATION_LORE":
      const response = await approveLocationLorePayment({
        amount,
        paymentId,
        stakeId: modelId,
      });
      return response;

    case "LATTICE_CALIBRATION":
      const calibrationResponse = await approveCalibrationPayment({
        amount,
        paymentId,
        contributionId: modelId,
      });
      return calibrationResponse;

    default:
      return { success: true };
  }
};
