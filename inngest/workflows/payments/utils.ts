import type { PaymentType } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";

type UpdatePaymentIdParams = {
  modelId: string;
  type: PaymentType;
  piPaymentId: string;
};

type UpdateTxIdParams = {
  modelId: string;
  type: PaymentType;
  piTxId: string;
};

type UpdateIncompleteParams = {
  modelId: string;
  type: PaymentType;
  piTxId?: string;
};

type UpsertIncompleteParams = {
  modelId: string;
  type: PaymentType;
  piPaymentId: string;
  userPiId: string;
  amount: number;
  extraData?: number;
};

export const updatePaymentId = async ({
  modelId,
  piPaymentId,
  type,
}: UpdatePaymentIdParams) => {
  switch (type) {
    case "SHARE_REDEMPTION":
      await prisma.shareRedemption.update({
        data: {
          piPaymentId,
          status: "PROCESSING",
        },
        select: { piPaymentId: true },
        where: { id: modelId, status: "PENDING" },
      });
      return true;

    case "MOCK_PAYMENT":
      await prisma.mockPayment.update({
        data: {
          piPaymentId,
          status: "PROCESSING",
        },
        select: { piPaymentId: true },
        where: { id: modelId, status: "PENDING" },
      });
      return true;

    default:
      return false;
  }
};

export const updateTxId = async ({
  modelId,
  piTxId,
  type,
}: UpdateTxIdParams) => {
  switch (type) {
    case "SHARE_REDEMPTION":
      await prisma.shareRedemption.update({
        where: { status: { in: ["PENDING", "PROCESSING"] }, id: modelId },
        data: { piTxId, status: "COMPLETED" },
        select: { piTxId: true },
      });
      return true;

    case "MOCK_PAYMENT":
      await prisma.mockPayment.update({
        data: {
          piTxId,
          status: "COMPLETED",
        },
        select: { piTxId: true },
        where: { id: modelId, status: { in: ["PENDING", "PROCESSING"] } },
      });
      return true;

    default:
      return false;
  }
};

export const updateIncomplete = async ({
  modelId,
  piTxId,
  type,
}: UpdateIncompleteParams) => {
  switch (type) {
    case "SHARE_REDEMPTION":
      await prisma.shareRedemption.update({
        where: {
          id: modelId,
        },
        data: {
          piTxId,
          status: piTxId ? "COMPLETED" : "FAILED",
        },
        select: { piPaymentId: true },
      });
      return true;

    case "MOCK_PAYMENT":
      await prisma.mockPayment.update({
        where: {
          id: modelId,
        },
        data: {
          piTxId,
          status: piTxId ? "COMPLETED" : "FAILED",
        },
        select: { piPaymentId: true },
      });
      return true;

    default:
      return false;
  }
};

export const upsertIncomplete = async ({
  modelId,
  piPaymentId,
  type,
  amount,
  userPiId,
  extraData,
}: UpsertIncompleteParams) => {
  switch (type) {
    case "SHARE_REDEMPTION":
      await prisma.shareRedemption.upsert({
        where: {
          id: modelId,
        },
        create: {
          piPaymentId,
          piReceived: amount,
          redemptionRate: extraData ? (extraData || 0) / amount : 0,
          sharesRedeemed: extraData || 0,
          userId: userPiId,
          id: modelId,
        },
        update: {},
        select: { status: true },
      });
      return true;

    case "MOCK_PAYMENT":
      await prisma.mockPayment.upsert({
        where: {
          id: modelId,
        },
        create: {
          piPaymentId,
          amount: new Decimal(amount),
          userPiId,
          type: "MAINNET_WALLET",
          id: modelId,
        },
        update: {},
        select: { status: true },
      });
      return true;

    default:
      return false;
  }
};
