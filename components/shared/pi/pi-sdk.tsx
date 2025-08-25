// This is a client-side module for Pi SDK integration
"use client";

import { toast } from "sonner";

import { PiSDK } from "@/types/pi";

// Mock Pi SDK for development (replace with actual SDK in production)
export const mockPiSDK: PiSDK = {
  authenticate: async (scopes) => {
    console.log("Authenticating with scopes:", scopes);
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      accessToken:
        "mock-access-token-" + Math.random().toString(36).substring(2, 15),
      user: {
        uid: "mock-user-id",
        username: "pioneer",
      },
    };
  },
  createPayment: async (payment, callbacks) => {
    console.log("Creating payment:", payment);
    // Simulate payment flow
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const paymentId =
      "mock-payment-id-" + Math.random().toString(36).substring(2, 15);
    callbacks.onReadyForServerApproval(paymentId);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    callbacks.onReadyForServerCompletion(paymentId, "mock-txid");
  },
  init({ version, sandbox }) {
    console.log({ version, sandbox });
  },
  async nativeFeaturesList() {
    return ["ad_network", "inline_media", "request_permission"];
  },
  openShareDialog(title, message) {
    toast.success(title, { description: message });
  },
  Ads: {
    async showAd(adType) {
      return { type: adType, result: "AD_CLOSED" };
    },
    async isAdReady(adType) {
      return { ready: true, type: adType };
    },
    async requestAd(adType) {
      return { result: "AD_LOADED", type: adType };
    },
  },
  async openUrlInSystemBrowser(url) {
    console.log(url);
  },
};

// Get Pi SDK from window or use mock for development
export function getPiSDK(): PiSDK {
  if (typeof window !== "undefined" && "Pi" in window) {
    return window.Pi;
  }

  throw new Error("Pi SDK not found");

  // console.warn("Pi SDK not found, using mock implementation");
  // return mockPiSDK;
}

// Helper to check if we're in Pi Browser
export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;

  // Check user agent for Pi Browser
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("pibrowser");
}
