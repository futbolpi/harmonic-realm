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

    default:
      return { success: true };
  }
};
