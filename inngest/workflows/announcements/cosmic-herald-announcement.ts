import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { inngest } from "@/inngest/client";

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
          await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: content }),
            }
          );
        } else {
          console.log(`[DEV ${messageType.toUpperCase()}]: ${content}`);
        }
      } else if (messageType === "bug") {
        if (isProd) {
          chatId = env.TELEGRAM_PRIVATE_CHANNEL;

          await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: content }),
            }
          );
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
