import { NextResponse } from "next/server";

import platformAPIClient from "@/lib/pi/platform-api-client";
import { PaymentDTO } from "@/types/pi";
import { completePayment, verifyPaymentCompletion } from "../complete/utils";

export async function POST(req: Request) {
  try {
    const { payment }: { payment: PaymentDTO } = await req.json();
    const paymentId = payment.identifier;
    const txid = payment?.transaction?.txid;
    const txURL = payment?.transaction?._link;

    if (!txid || !txURL) {
      // let Pi Servers know that payment was cancelled
      await platformAPIClient.post(`/payments/${paymentId}/cancel`);
      return new NextResponse(`Cancelled the payment ${paymentId}`, {
        status: 200,
      });
    }

    const piPlatformPayment = await platformAPIClient.get<PaymentDTO>(
      `/payments/${paymentId}`
    );

    const {
      metadata: { modelId, type },
      amount,
    } = piPlatformPayment.data;

    const isVerified = await verifyPaymentCompletion({
      txURL,
      platformPayment: { amount, paymentId },
    });

    if (!isVerified) {
      await platformAPIClient.post(`/payments/${paymentId}/cancel`);
      return new NextResponse("Unverified Payment", { status: 200 });
    }

    // let Pi Servers know that the payment is completed
    await platformAPIClient.post(`/payments/${paymentId}/complete`, {
      txid,
    });

    await completePayment({ amount, modelId, paymentId, txid, type });

    return new NextResponse(`Handled the incomplete payment ${paymentId}`, {
      status: 200,
    });
  } catch (error) {
    console.error("[INCOMPLETE_PAYMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
