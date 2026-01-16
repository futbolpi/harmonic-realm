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
   * Schedule a challenge resolution workflow by emitting a challenge.started event.
   * The challenge workflow will sleep until the challenge ends and then resolve it.
   */
  static async scheduleChallengeResolution(
    challengeId: string,
    endsAt?: string
  ) {
    return await inngest.send({
      name: "territory/challenge.started",
      data: { challengeId, endsAt },
    });
  }

  /**
   * Notify that a territory was claimed (schedules expiry workflow if desired)
   */
  static async territoryClaimed(territoryId: string, controlEndsAt: string) {
    return await inngest.send({
      name: "territory/claimed",
      data: { territoryId, controlEndsAt },
    });
  }

  static async completeChallengeForGuild(
    progressId: string,
    guildId: string,
    challengeId: string
  ) {
    return await inngest.send({
      name: "guild/challenge.completed",
      data: { progressId, guildId, challengeId },
    });
  }

  /**
   * Batch send multiple events
   */
  static async sendBatch(events: Array<Events>) {
    return await inngest.send(events);
  }
}
