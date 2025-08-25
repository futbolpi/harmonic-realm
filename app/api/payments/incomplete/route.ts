import { NextResponse } from "next/server";

import platformAPIClient from "@/lib/pi/platform-api-client";
import { PaymentDTO } from "@/types/pi";
import { verifyPaymentCompletion } from "../utils";

export async function POST(req: Request) {
  try {
    const { payment }: { payment: PaymentDTO } = await req.json();
    const paymentId = payment.identifier;
    const txid = payment?.transaction?.txid as string;
    const txURL = payment?.transaction?._link as string;

    const piPlatformPayment = await platformAPIClient.get<PaymentDTO>(
      `/payments/${paymentId}`
    );

    const {
      metadata: { modelId, type },
    } = piPlatformPayment.data;

    // let Pi Servers know that the payment is completed
    await platformAPIClient.post(`/payments/${paymentId}/complete`, {
      txid,
    });

    const isVerified = await verifyPaymentCompletion({
      modelId,
      txId: txid,
      type,
      txURL,
    });

    if (!isVerified) {
      return new NextResponse("Unverified Payment", { status: 400 });
    }

    return new NextResponse(`Handled the incomplete payment ${paymentId}`, {
      status: 200,
    });
  } catch (error) {
    console.error("[INCOMPLETE_PAYMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
