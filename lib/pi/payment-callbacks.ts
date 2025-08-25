import { OnIncompletePaymentFound, PaymentCallbacks } from "@/types/pi";
import axiosClient, { axiosConfig } from "../site/client";

export const onIncompletePaymentFound: OnIncompletePaymentFound = async (
  payment
) => {
  console.log("onIncompletePaymentFound", payment);
  return axiosClient.post("/payments/incomplete", { payment });
};

const onReadyForServerApproval: PaymentCallbacks["onReadyForServerApproval"] =
  async (paymentId) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post(`/payments/approve`, { paymentId }, axiosConfig);
  };

const onReadyForServerCompletion: PaymentCallbacks["onReadyForServerCompletion"] =
  async (paymentId, txid) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    axiosClient.post(`/payments/complete`, { paymentId, txid }, axiosConfig);
  };

const onCancel: PaymentCallbacks["onCancel"] = (paymentId) => {
  console.log("onCancel", paymentId);

  return axiosClient.post("/payments/cancel", { paymentId });
};

const onError: PaymentCallbacks["onError"] = (error, payment) => {
  console.error("onError", error);
  if (payment) {
    console.log(payment);
    // handle the error accordingly send notification to admin
  }
};

export const piPaymentCallbacks: PaymentCallbacks = {
  onCancel,
  onError,
  onReadyForServerApproval,
  onReadyForServerCompletion,
};
