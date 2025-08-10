import { $Enums } from "@/lib/generated/prisma";
import { AuthResultSchema } from "@/lib/schema/auth";

declare global {
  interface Window {
    Pi: PiSDK;
  }
}

// Pi SDK types
export type PiUser = AuthResultSchema["user"];

export type PiMetadata = {
  type: $Enums.PaymentType;
  modelId: string;
};

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: PiMetadata;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  // Blockchain transaction data:
  transaction: null | {
    // This is null if no transaction has been made yet
    txid: string; // id of the blockchain transaction
    verified: boolean; // true if the transaction matches the payment, false otherwise
    _link: string; // a link to the operation on the Blockchain API
  };
}

// Pi SDK interface
export interface PiSDK {
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound?: (payment: PiPayment) => void
  ) => Promise<{ accessToken: string; user: PiUser }>;
  createPayment: (
    payment: { amount: number; memo: string; metadata?: PiMetadata },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: PiPayment) => void;
    }
  ) => Promise<void>;
  init: ({ version, sandbox }: { version: string; sandbox: boolean }) => void;
}

export type OnIncompletePaymentFound = Parameters<PiSDK["authenticate"]>[1];

export type PiCallbacks = Parameters<PiSDK["createPayment"]>[1];

export type AppToUserParams = {
  amount: number;
  memo: string;
  metadata: PiMetadata;
  uid: string;
};
