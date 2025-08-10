import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // PRISMA
    DATABASE_URL: z.url(),

    // MISC
    NODE_ENV: z.enum(["development", "production", "test"]),

    // PI NETWORK
    PI_PLATFORM_API_URL: z.url(),
    PI_API_KEY: z.string().min(1),
    PI_SECRET_KEY: z.string().optional(),

    // TELEGRAM
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    TELEGRAM_PUBLIC_CHANNEL: z.string().min(1),
    TELEGRAM_PRIVATE_CHANNEL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),

    //PINETWORK
    NEXT_PUBLIC_PINET_URL: z.url(),
    NEXT_PUBLIC_WALLET_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_PI_EXPLORER_LINK: z.url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_PUBLIC_CHANNEL: process.env.TELEGRAM_PUBLIC_CHANNEL,
    TELEGRAM_PRIVATE_CHANNEL: process.env.TELEGRAM_PRIVATE_CHANNEL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // PI NETWORK
    PI_PLATFORM_API_URL: process.env.PI_PLATFORM_API_URL,
    PI_API_KEY: process.env.PI_API_KEY,
    NEXT_PUBLIC_PI_EXPLORER_LINK: process.env.NEXT_PUBLIC_PI_EXPLORER_LINK,
    NEXT_PUBLIC_PINET_URL: process.env.NEXT_PUBLIC_PINET_URL,
    PI_SECRET_KEY: process.env.PI_SECRET_KEY,
    NEXT_PUBLIC_WALLET_ADDRESS: process.env.NEXT_PUBLIC_WALLET_ADDRESS,
  },
});
