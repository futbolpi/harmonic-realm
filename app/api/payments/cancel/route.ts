import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import platformAPIClient from "@/lib/pi/platform-api-client";

export async function POST(req: Request) {
  try {
    const {
      paymentId,
    }: {
      paymentId: string;
    } = await req.json();

    /* 
      DEVELOPER NOTE:
      implement logic here 
      e.g. delete pitransaction if already created

    */

    const tx = await prisma.locationLoreStake.findFirst({
      where: { paymentId },
    });
    if (tx) {
      await prisma.locationLoreStake.update({
        where: { id: tx.id },
        data: { paymentStatus: "CANCELLED" },
      });
    }

    // let Pi Servers know that payment was cancelled
    await platformAPIClient.post(`/payments/${paymentId}/cancel`);
    return new NextResponse(`Cancelled the payment ${paymentId}`, {
      status: 200,
    });
  } catch (error) {
    console.error("[CANCEL_PI_PAYMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
