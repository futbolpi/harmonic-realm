import axios from "axios";

import { PaymentType } from "@/lib/generated/prisma/enums";
import { ApiResponse } from "@/lib/schema/api";
import { completeLocationLorePayment } from "@/lib/api-helpers/server/location-lore/complete-lore-payment";
import { completeCalibrationPayment } from "@/lib/api-helpers/server/calibration/complete-calibration-payment";

type VerifyPaymentParams = {
  txURL: string;
  platformPayment: { paymentId: string; amount: number };
};

type CompletionParams = {
  type: PaymentType;
  amount: number;
  modelId: string;
  paymentId: string;
  txid: string;
};

export async function verifyPaymentCompletion({
  txURL,
  platformPayment: { amount, paymentId },
}: VerifyPaymentParams) {
  // check the transaction on the Pi blockchain
  const horizonResponse = await axios.create({ timeout: 20000 }).get(txURL);
  const operationsResponse = await axios
    .create({ timeout: 20000 })
    .get(`${txURL}/operations`);
  const horizonAmount = operationsResponse.data._embedded.records[0]
    .amount as string;
  const paymentIdOnBlock = horizonResponse.data.memo;

  // and check other data as well e.g. amount
  if (amount < parseFloat(horizonAmount)) {
    console.error(
      "[VERIFY_PAYMENT_COMPLETION]",
      "Payment amount not the same with blockchain payment"
    );
    return false;
  }

  if (paymentIdOnBlock !== paymentId) {
    console.error(
      "[VERIFY_PAYMENT_COMPLETION]",
      "Payment id not same with blockchain"
    );
    return false;
  }

  return true;
}

export const completePayment = async ({
  amount,
  modelId,
  type,
  paymentId,
  txid,
}: CompletionParams): Promise<ApiResponse<undefined>> => {
  switch (type) {
    case "LOCATION_LORE":
      const response = await completeLocationLorePayment({
        amount,
        paymentId,
        stakeId: modelId,
        txid,
      });
      return response;

    case "LATTICE_CALIBRATION":
      const calibrationResponse = await completeCalibrationPayment({
        amount,
        paymentId,
        contributionId: modelId,
        txid,
      });
      return calibrationResponse;

    default:
      return { success: true };
  }
};
