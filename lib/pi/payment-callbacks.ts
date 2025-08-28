import { OnIncompletePaymentFound, PiPaymentCallbacks } from "@/types/pi";
import axiosClient, { axiosConfig } from "../site/client";

export const onIncompletePaymentFound: OnIncompletePaymentFound = async (
  payment
) => {
  console.log("onIncompletePaymentFound", payment);
  return axiosClient.post("/payments/incomplete", { payment });
};

const onReadyForServerApproval: PiPaymentCallbacks["onReadyForServerApproval"] =
  async (paymentId) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post(`/payments/approve`, { paymentId }, axiosConfig);
  };

const onReadyForServerCompletion: PiPaymentCallbacks["onReadyForServerCompletion"] =
  async (paymentId, txid) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    axiosClient.post(`/payments/complete`, { paymentId, txid }, axiosConfig);
  };

const onCancel: PiPaymentCallbacks["onCancel"] = (paymentId) => {
  console.log("onCancel", paymentId);

  return axiosClient.post("/payments/cancel", { paymentId });
};

const onError: PiPaymentCallbacks["onError"] = (error, payment) => {
  console.error("onError", error);
  if (payment) {
    console.log(payment);
    // handle the error accordingly send notification to admin
  }
};

export const piPaymentCallbacks: PiPaymentCallbacks = {
  onCancel,
  onError,
  onReadyForServerApproval,
  onReadyForServerCompletion,
};
