import { NextResponse } from "next/server";

import platformAPIClient from "@/lib/pi/platform-api-client";
import { PaymentDTO } from "@/types/pi";
import { cancelPayment } from "./utils";

export async function POST(req: Request) {
  try {
    const {
      paymentId,
    }: {
      paymentId: string;
    } = await req.json();

    const currentPayment = await platformAPIClient.get<PaymentDTO>(
      `/payments/${paymentId}`
    );

    /* 
      DEVELOPER NOTE:
      implement logic here 
      e.g. delete pitransaction if already created

    */

    const {
      metadata: { modelId, type },
    } = currentPayment.data;

    await cancelPayment({ modelId, type });

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
