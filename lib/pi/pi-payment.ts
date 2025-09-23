// lib/services/pi-payment.ts
// Pi Network payment integration service for Location Lore staking

import { getPiSDK } from "@/components/shared/pi/pi-sdk";
import { PaymentDTO, PiPaymentData } from "@/types/pi";
import { piPaymentCallbacks } from "./payment-callbacks";
import { ContributionTier } from "../generated/prisma/enums";

/**
 * Pi Network Payment Service
 * Handles secure Pi cryptocurrency payments for Location Lore staking
 * and Awakening contributions with comprehensive error handling
 */
export class PiPaymentService {
  private readonly sandbox: boolean;

  constructor() {
    this.sandbox = process.env.NODE_ENV !== "production";
  }

  /**
   * Initialize Pi SDK (call this on client-side component mount)
   */
  async initializePiSDK(): Promise<boolean> {
    try {
      // Pi SDK is loaded via script tag in _document.tsx or layout
      const piSdk = getPiSDK();

      piSdk.init({
        version: "2.0",
        sandbox: this.sandbox,
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize Pi SDK:", error);
      return false;
    }
  }

  /**
   * Create payment for Location Lore staking
   */
  async createLocationLorePayment(
    stakeId: string,
    targetLevel: number,
    piAmount: number
  ): Promise<void> {
    const paymentData: PiPaymentData = {
      amount: piAmount,
      memo: `HarmonicRealm: Payment for Level ${targetLevel} Lore for Node`,
      metadata: {
        modelId: stakeId,
        type: "LOCATION_LORE",
        level: targetLevel,
      },
    };

    return this.processPayment(paymentData);
  }

  /**
   * Create payment for Awakening contribution
   */
  async createAwakeningPayment(
    phaseNumber: number,
    piAmount: number
  ): Promise<void> {
    const tier = this.calculateContributionTier(piAmount);

    const paymentData: PiPaymentData = {
      amount: piAmount,
      memo: `HarmonicRealm: Phase ${phaseNumber} Awakening Contribution (${tier})`,
      metadata: {
        modelId: phaseNumber.toString(),
        type: "AWAKENING",
      },
    };

    return this.processPayment(paymentData);
  }

  /**
   * Core payment processing logic
   */
  private async processPayment(paymentData: PiPaymentData): Promise<void> {
    try {
      // Validate payment amount
      this.validatePaymentAmount(paymentData.amount);
      const piSdk = getPiSDK();

      // Create payment request
      await piSdk.createPayment(
        {
          amount: paymentData.amount,
          memo: paymentData.memo,
          metadata: paymentData.metadata,
        },
        {
          onReadyForServerApproval: this.handlePaymentApproval,
          onReadyForServerCompletion: this.handlePaymentCompletion,
          onCancel: this.handlePaymentCancellation,
          onError: this.handlePaymentError,
        }
      );
    } catch (error) {
      throw new PiPaymentError(
        `Failed to create payment: ${
          error instanceof Error ? error.message : "Unknown Error"
        }`,
        error
      );
    }
  }

  /**
   * Server-side payment approval
   */
  private async handlePaymentApproval(paymentId: string): Promise<void> {
    piPaymentCallbacks.onReadyForServerApproval(paymentId);

    // Could trigger analytics event here
    // analytics.track('payment_approved', { paymentId });
  }

  /**
   * Server-side payment completion
   */
  private async handlePaymentCompletion(
    paymentId: string,
    txid: string
  ): Promise<void> {
    piPaymentCallbacks.onReadyForServerCompletion(paymentId, txid);
  }

  /**
   * Calculate contribution tier based on Pi amount
   */
  private calculateContributionTier(piAmount: number): ContributionTier {
    if (piAmount >= 50) return "COSMIC_FOUNDER";
    if (piAmount >= 10) return "LATTICE_ARCHITECT";
    if (piAmount >= 1) return "RESONANCE_PATRON";
    return "ECHO_SUPPORTER";
  }

  /**
   * Validate payment amount
   */
  private validatePaymentAmount(amount: number): void {
    if (typeof amount !== "number" || amount <= 0) {
      throw new PiPaymentError("Payment amount must be a positive number");
    }

    if (amount > 1000) {
      throw new PiPaymentError(
        "Payment amount exceeds maximum limit (1000 Pi)"
      );
    }

    // Check minimum amounts for different tiers
    if (amount < 0.1) {
      throw new PiPaymentError("Payment amount must be at least 0.1 Pi");
    }
  }

  /**
   * Handle payment cancellation
   */
  private handlePaymentCancellation(paymentId: string): void {
    console.log("Payment cancelled:", paymentId);
    piPaymentCallbacks.onCancel(paymentId);

    // Could trigger analytics event here
    // analytics.track('payment_cancelled', { paymentId });
  }

  /**
   * Handle payment error
   */
  private handlePaymentError(error: Error, payment?: PaymentDTO): void {
    console.error("Payment error:", error, payment);
    piPaymentCallbacks.onError(error, payment);

    // Could trigger analytics event here
    // analytics.track('payment_error', { error: error.message, payment });
  }
}

/**
 * Custom error class for Pi payment errors
 */
export class PiPaymentError extends Error {
  constructor(message: string, public readonly piError?: unknown) {
    super(message);
    this.name = "PiPaymentError";
  }
}

// Singleton instance
export const piPayment = new PiPaymentService();
