import PiNetwork from "pi-backend";

import { env } from "@/env";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { PiPaymentData, PaymentDTO } from "@/types/pi";

export const appToUserPayment = inngest.createFunction(
  { id: "app-to-user-payment", retries: 1 },
  { event: "payments/app-to-user" },
  async ({ event, step }) => {
    const { amount, memo, modelId, type, uid } = event.data;

    // get bounty with payment ID

    // CREATE Pi instance
    const apiKey = env.PI_API_KEY;
    const walletPrivateSeed = env.PI_SECRET_KEY; // starts with S

    if (!walletPrivateSeed) {
      return {
        message: "App to User Payment not activated yet",
        paymentData: { amount, memo, modelId, type, uid },
      };
    }

    const pi = new PiNetwork(apiKey, walletPrivateSeed);

    const paymentData: PiPaymentData & { uid: string } = {
      amount,
      memo,
      metadata: { modelId, type },
      uid,
    };
    // It is critical that you store paymentId in your database
    // so that you don't double-pay the same user, by keeping track of the payment.

    // check if there is incomplete payment
    const incompletePayments = await step.run("get-incomplete-payments", () => {
      return pi.getIncompleteServerPayments() as unknown as {
        incomplete_server_payments: PaymentDTO[];
      };
    });

    // if there is get db payment
    if (incompletePayments.incomplete_server_payments.length > 0) {
      const incompletePayment =
        incompletePayments.incomplete_server_payments[0];

      await step.run("upsert-db-incomplete-payments", () => {
        return prisma.shareRedemption.upsert({
          where: {
            id: incompletePayment.metadata.modelId,
          },
          create: {
            piPaymentId: incompletePayment.identifier,
            piReceived: incompletePayment.amount,
            redemptionRate:
              (incompletePayment.metadata.level || 0) /
              incompletePayment.amount,
            sharesRedeemed: incompletePayment.metadata.level || 0,
            userId: incompletePayment.user_uid,
          },
          update: {},
          select: { status: true },
        });
      });
      // submit and complete transaction if no transaction
      if (incompletePayment.transaction === null) {
        // It is strongly recommended that you store the txId along with the paymentId you stored earlier for your reference.
        const txId = await step
          .run("submit-incomplete-payment", async () => {
            return pi.submitPayment(incompletePayment.identifier);
          })
          .catch((err) => {
            console.log({ err });
            step.run("cancel-incomplete-payment", async () => {
              await pi.cancelPayment(incompletePayment.identifier);
            });
          });

        if (txId) {
          await step.run("update-db-incomplete-payment", async () => {
            return prisma.shareRedemption.update({
              where: { id: incompletePayment.metadata.modelId },
              data: { piTxId: txId, status: "COMPLETED" },
              select: { piPaymentId: true },
            });
          });

          await step.run("complete-incomplete-payment", async () => {
            return pi.completePayment(incompletePayment.identifier, txId);
          });
        }

        // just complete transaction
      } else {
        await step.run("update-db-incomplete-payment", async () => {
          return prisma.shareRedemption.update({
            where: {
              id: incompletePayment.metadata.modelId,
            },
            data: {
              piTxId: incompletePayment.transaction?.txid,
              status: incompletePayment.transaction?.txid
                ? "COMPLETED"
                : "FAILED",
            },
            select: { piPaymentId: true },
          });
        });

        await step.run("complete-incomplete-payment", async () => {
          if (!incompletePayment.transaction?.txid) {
            return pi.cancelPayment(incompletePayment.identifier);
          }
          return pi.completePayment(
            incompletePayment.identifier,
            incompletePayment.transaction?.txid
          );
        });
      }
    }

    const piPaymentId = await step.run("create-payment", () => {
      return pi.createPayment(paymentData);
    });

    await step.run("update-shares-record-payment", async () => {
      return prisma.shareRedemption.update({
        data: {
          piPaymentId,
          status: "PROCESSING",
        },
        select: { piPaymentId: true },
        where: { id: modelId, status: "PENDING" },
      });
    });

    // It is strongly recommended that you store the txId along with the paymentId you stored earlier for your reference.
    const piTxId = await step.run("submit-payment", async () => {
      return pi.submitPayment(piPaymentId);
    });

    await step.run("update-db-payment", async () => {
      return prisma.shareRedemption.update({
        where: { piPaymentId, status: "PROCESSING", id: modelId },
        data: { piTxId, status: "COMPLETED" },
        select: { piPaymentId: true },
      });
    });

    const { transaction } = await step.run("complete-payment", async () => {
      return pi.completePayment(piPaymentId, piTxId);
    });

    if (!transaction) {
      return { message: "Transaction was not completed!!!" };
    }

    const txLink = `${env.NEXT_PUBLIC_PI_EXPLORER_LINK}/tx/${transaction.txid}`;

    const message = `<b>🎉 Reward Sent! 🎉</b>

We are excited to announce that a reward of <b>${amount.toFixed(
      2
    )}</b> Pi has been successfully sent out!

Check the transaction details on Pi Explorer: <a href="${txLink}">View Transaction</a>

Thank you for being a valued member of the MitiMara community!
    `;

    await step.sendEvent("send-user-paid-event-notification", {
      name: "cosmic-herald-announcement",
      data: { content: message, messageType: "announcement" },
    });

    // return

    return { message: `User: ${uid} successfully paid ${amount.toFixed(2)}` };
  }
);
