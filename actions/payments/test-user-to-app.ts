"use server";

import { siteConfig } from "@/config/site";
import { InngestEventDispatcher } from "@/inngest/dispatcher";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import prisma from "@/lib/prisma";

export const testUserToApp = async (accessToken: string) => {
  try {
    if (siteConfig.network !== "testnet") {
      return { success: false, error: "Wrong Network" };
    }
    const { piId: userId } = await verifyTokenAndGetUser(accessToken);

    const amount = 0.1;

    const memo = `Sending ${amount} Pi for test payments`;

    const { id: modelId } = await prisma.shareRedemption.create({
      data: {
        piReceived: amount,
        redemptionRate: 0.1,
        sharesRedeemed: 1,
        userId,
      },
      select: { id: true },
    });

    await InngestEventDispatcher.sendAppToUserPayment({
      amount,
      memo,
      modelId,
      type: "SHARE_REDEMPTION",
      uid: userId,
    });

    return { success: true, message: "Test payment sent successfully" };
  } catch (error) {
    console.error("Test user to app payment error:", error);
    return {
      success: false,
      error: "Failed to send user to app payment",
    };
  }
};
