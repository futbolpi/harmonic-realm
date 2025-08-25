import { PaymentType } from "@/lib/generated/prisma/enums";

type VerifyPaymentParams = {
  txURL: string;
  txId: string;
  modelId: string;
  type: PaymentType;
};

export const verifyPaymentCompletion = async (params: VerifyPaymentParams) => {
  // switch statements based on tx type
  console.log(params);
  return true;
};
