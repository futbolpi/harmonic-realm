import { OnIncompletePaymentFound, PiCallbacks, PiPayment } from "@/types/pi";
import axiosClient, { axiosConfig } from "../site/client";

export const onIncompletePaymentFound: OnIncompletePaymentFound = async (
  payment
) => {
  console.log("onIncompletePaymentFound", payment);
  return axiosClient.post("/payments/incomplete", { payment });
};

const onReadyForServerApproval = async (paymentId: string) => {
  console.log("onReadyForServerApproval", paymentId);
  axiosClient.post(`/payments/approve`, { paymentId }, axiosConfig);
};

const onReadyForServerCompletion = async (paymentId: string, txid: string) => {
  console.log("onReadyForServerCompletion", paymentId, txid);
  axiosClient.post(`/payments/complete`, { paymentId, txid }, axiosConfig);
};

const onCancel = (paymentId: string) => {
  console.log("onCancel", paymentId);

  return axiosClient.post("/payments/cancel", { paymentId });
};

const onError = (error: Error, payment?: PiPayment) => {
  console.error("onError", error);
  if (payment) {
    console.log(payment);
    // handle the error accordingly send notification to admin
  }
};

export const piPaymentCallbacks: PiCallbacks = {
  onCancel,
  onError,
  onReadyForServerApproval,
  onReadyForServerCompletion,
};
