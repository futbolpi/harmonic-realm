import { LoreLevel } from "@/lib/node-lore/location-lore";
import { PiMetadata } from "@/types/pi";
import { PaymentType } from "@/lib/generated/prisma/enums";
import { inngest } from "./client";
import { Events } from "./events";

/**
 * Utility functions for event dispatching
 */
export class InngestEventDispatcher {
  /**
   * Dispatch lore generation started event
   */
  static async startLoreGeneration(
    nodeId: string,
    targetLevel: LoreLevel,
    jobId: string
  ) {
    return await inngest.send({
      name: "lore/generation.started",
      data: {
        nodeId,
        targetLevel,
        jobId,
      },
    });
  }

  /**
   * Dispatch payment processed event
   */
  static async processPayment(
    paymentId: string,
    userId: string,
    amount: number,
    metadata: PiMetadata
  ) {
    return await inngest.send({
      name: "payment/pi-payment.processed",
      data: {
        paymentId,
        userId,
        amount,
        metadata,
      },
    });
  }

  /**
   * Dispatch cosmic herald announcement
   */
  static async sendHeraldAnnouncement(
    content: string,
    messageType: "bug" | "announcement"
  ) {
    return await inngest.send({
      name: "cosmic-herald-announcement",
      data: {
        content,
        messageType,
      },
    });
  }

  /**
   * Send Payment from app to user
   */
  static async sendAppToUserPayment({
    amount,
    memo,
    modelId,
    uid,
    type,
  }: {
    amount: number;
    memo: string;
    modelId: string;
    uid: string;
    type: PaymentType;
  }) {
    return await inngest.send({
      name: "payments/app-to-user",
      data: { amount, memo, modelId, type, uid },
    });
  }

  /**
   * Start Genesis Phase Node Generation
   */
  static async startGenesisPhase() {
    return await inngest.send({
      name: "phase/generate.initial",
    });
  }

  /**
   * Start Lattice Calibration Event
   */
  static async startLatticeCalibration(gamePhaseId: number) {
    return await inngest.send({
      name: "calibration/triggered",
      data: { gamePhaseId },
    });
  }

  /**
   * Batch send multiple events
   */
  static async sendBatch(events: Array<Events>) {
    return await inngest.send(events);
  }
}
