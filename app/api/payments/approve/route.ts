import { NextResponse } from "next/server";

import platformAPIClient from "@/lib/pi/platform-api-client";
import { PaymentDTO } from "@/types/pi";
import { verifyPaymentApproval } from "./utils";

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
      e.g. ensure there is no prev pi payment with payment ID, 
      
      check if amount is right with business logic 
      (use currentPayment type) => u can add helper fn 
      use switch with type (this is where you confirm amount)
    */

    const {
      amount,
      metadata: { modelId, type },
    } = currentPayment.data;

    const { success: isVerified, error } = await verifyPaymentApproval({
      type,
      amount,
      modelId,
      paymentId,
    });

    if (!isVerified) {
      return new NextResponse(error || "Unverified Payment", { status: 400 });
    }

    // let Pi Servers know that you're ready
    await platformAPIClient.post(`/payments/${paymentId}/approve`);

    return new NextResponse(`Approved the payment ${paymentId}`, {
      status: 200,
    });
  } catch (error) {
    console.error("[PAYMENT_APPROVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
