import { NextResponse } from "next/server";

import { PaymentDTO } from "@/types/pi";
import platformAPIClient from "@/lib/pi/platform-api-client";
import { completePayment, verifyPaymentCompletion } from "./utils";

export async function POST(req: Request) {
  try {
    const {
      paymentId,
      txid,
    }: {
      paymentId: string;
      txid: string;
    } = await req.json();

    const currentPayment = await platformAPIClient.get<PaymentDTO>(
      `/payments/${paymentId}`
    );

    /* 
      DEVELOPER NOTE:
      implement logic here 
      e.g. verify transaction with blockchain data, 
      change payment status to confirmed, add txid and add send 
      completePayment event
     
    */

    // verify with horizon data (amount, paymentid and txid)

    const {
      amount,
      metadata: { modelId, type },
    } = currentPayment.data;

    const isVerified = await verifyPaymentCompletion({
      platformPayment: { amount, paymentId },
      txURL: currentPayment.data.transaction?._link as string,
    });

    if (!isVerified) {
      return new NextResponse("Unverified Payment", { status: 400 });
    }

    // let Pi server know that the payment is completed
    await platformAPIClient.post(`/payments/${paymentId}/complete`, {
      txid,
    });

    // finally complete the payment
    const completedPayment = await completePayment({
      amount,
      modelId,
      paymentId,
      txid,
      type,
    });

    if (!completedPayment.success) {
      console.error("Incomplete Payment: ", completedPayment.error);
      // send failure notification
    } else {
      // send success notification
    }

    return new NextResponse(`Completed the payment ${paymentId}`, {
      status: 200,
    });
  } catch (error) {
    console.error("[COMPLETE_PAYMENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
