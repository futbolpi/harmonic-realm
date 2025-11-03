import { siteConfig } from "@/config/site";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import prisma from "@/lib/prisma";

export const sendMockPayment = async (userPiId: string) => {
  if (siteConfig.network === "testnet") {
    const amount = 0.1;
    const { id: modelId } = await prisma.mockPayment.create({
      data: { amount, type: "MAINNET_WALLET", userPiId },
      select: { id: true },
    });
    await InngestEventDispatcher.sendAppToUserPayment({
      amount,
      memo: "Mock payment for mainnet wallet application",
      modelId,
      type: "MOCK_PAYMENT",
      uid: userPiId,
    });
  }
};
