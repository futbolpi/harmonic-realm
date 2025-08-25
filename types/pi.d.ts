import { PaymentType } from "@/lib/generated/prisma/enums";
import { AuthResultSchema } from "@/lib/schema/auth";

declare global {
  interface Window {
    Pi: PiSDK;
  }
}

type NativeFeature = "inline_media" | "request_permission" | "ad_network";

type AdType = "interstitial" | "rewarded";

type ShowAdResponse =
  | {
      type: "interstitial";
      result:
        | "AD_CLOSED"
        | "AD_DISPLAY_ERROR"
        | "AD_NETWORK_ERROR"
        | "AD_NOT_AVAILABLE";
    }
  | {
      type: "rewarded";
      result:
        | "AD_REWARDED"
        | "AD_CLOSED"
        | "AD_DISPLAY_ERROR"
        | "AD_NETWORK_ERROR"
        | "AD_NOT_AVAILABLE"
        | "ADS_NOT_SUPPORTED"
        | "USER_UNAUTHENTICATED";
      adId?: string;
    };

type IsAdReadyResponse = {
  type: AdType;
  ready: boolean;
};

type RequestAdResponse = {
  type: "interstitial" | "rewarded";
  result: "AD_LOADED" | "AD_FAILED_TO_LOAD" | "AD_NOT_AVAILABLE";
};

// Pi SDK types
export type PiUser = AuthResultSchema["user"];

type AuthResult = {
  accessToken: string;
  user: PiUser;
};

export type PiMetadata = {
  type: PaymentType;
  modelId: string;
};

export type PaymentData = {
  amount: number;
  memo: string;
  metadata: PiMetadata;
};

type Direction = "user_to_app" | "app_to_user";
type AppNetwork = "Pi Network" | "Pi Testnet";
type Scope = "username" | "payments" | "wallet_address";

export type PaymentDTO = {
  // Payment data:
  identifier: string; // payment identifier
  user_uid: string; // user's app-specific ID
  amount: number; // payment amount
  memo: string; // a string provided by the developer, shown to the user
  metadata: PiMetadata; // an object provided by the developer for their own usage
  from_address: string; // sender address of the blockchain transaction
  to_address: string; // recipient address of the blockchain transaction
  direction: Direction; // direction of the payment
  created_at: string; // payment's creation timestamp
  network: AppNetwork; // a network of the payment

  // Status flags representing the current state of this payment
  status: {
    developer_approved: boolean; // Server-Side Approval
    transaction_verified: boolean; // blockchain transaction verified
    developer_completed: boolean; // server-Side Completion
    cancelled: boolean; // cancelled by the developer or by Pi Network
    user_cancelled: boolean; // cancelled by the user
  };

  // Blockchain transaction data:
  transaction: null | {
    // This is null if no transaction has been made yet
    txid: string; // id of the blockchain transaction
    verified: boolean; // true if the transaction matches the payment, false otherwise
    _link: string; // a link to the operation on the Blockchain API
  };
};

export type PaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PaymentDTO) => void;
};

// Pi SDK interface
export interface PiSDK {
  authenticate: (
    scopes: Array<Scope>,
    onIncompletePaymentFound?: (payment: PaymentDTO) => void
  ) => Promise<AuthResult>;
  createPayment: (
    payment: PaymentData,
    callbacks: PaymentCallbacks
  ) => Promise<void>;
  init: ({ version, sandbox }: { version: string; sandbox: boolean }) => void;
  nativeFeaturesList: () => Promise<Array<NativeFeature>>;
  openShareDialog: (title: string, message: string) => void;
  Ads: {
    showAd: (adType: AdType) => Promise<ShowAdResponse>;
    isAdReady: (adType: AdType) => Promise<IsAdReadyResponse>;
    requestAd: (adType: AdType) => Promise<RequestAdResponse>;
  };
  openUrlInSystemBrowser: (url: string) => Promise<void>;
}

export type OnIncompletePaymentFound = Parameters<PiSDK["authenticate"]>[1];

export type AppToUserParams = {
  amount: number;
  memo: string;
  metadata: PiMetadata;
  uid: string;
};
