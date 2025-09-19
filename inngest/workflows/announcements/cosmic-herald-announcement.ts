import axios from "axios";

import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { inngest } from "@/inngest/client";

const telegramClient = axios.create({
  baseURL: "https://api.telegram.org",
  timeout: 10000,
});

export const cosmicHeraldAnnouncement = inngest.createFunction(
  {
    id: "cosmic-herald-announcement",
    retries: 3,
  },
  { event: "cosmic-herald-announcement" },
  async ({ event, step }) => {
    const { messageType, content } = event.data;
    const isProd = env.NODE_ENV === "production";
    const network = siteConfig.network; // 'testnet' or 'mainnet'

    await step.run("send-message", async () => {
      let chatId;

      if (messageType === "announcement") {
        if (isProd) {
          if (network === "testnet") {
            chatId = env.TELEGRAM_PRIVATE_CHANNEL; // Testnet in prod to dev
          } else {
            chatId = env.TELEGRAM_PUBLIC_CHANNEL;
          }

          try {
            await telegramClient.post(
              `/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: chatId,
                text: content,
                parse_mode: "HTML",
              }
            );
          } catch (error) {
            console.log({ error });
          }
        } else {
          console.log(`[DEV ${messageType.toUpperCase()}]: ${content}`);
        }
      } else if (messageType === "bug") {
        if (isProd) {
          chatId = env.TELEGRAM_PRIVATE_CHANNEL;

          try {
            await telegramClient.post(
              `/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: chatId,
                text: content,
                parse_mode: "HTML",
              }
            );
          } catch (error) {
            console.log({ error });
          }
        } else {
          console.error(`[DEV BUG]: ${content}`);
        }
      } else {
        throw new Error("Invalid messageType");
      }
    });

    return { status: "Announcement sent" };
  }
);
