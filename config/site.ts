import { env } from "@/env";
// import { Prisma } from "@/lib/generated/prisma";

// export const ecosystemRewardPot: Prisma.RewardPotCreateInput = {
//   name: "Ecosystem Reward Pot",
//   isOpen: true,
//   isPublic: true,
//   revenueFraction: 85 / 100,
// };

// export const platformPot: Prisma.RewardPotCreateInput = {
//   name: "Platform Development Pot",
//   isOpen: true,
//   isPublic: true,
//   revenueFraction: 15 / 100,
// };

export type SiteConfig = {
  id: string;
  name: string;
  network: "testnet" | "mainnet";
};

export const siteConfig: SiteConfig = {
  name: "Pi Quiz",
  id: "pi-quiz",
  network: env.NEXT_PUBLIC_PI_EXPLORER_LINK.includes("testnet")
    ? "testnet"
    : "mainnet",
};

export const SiteId = `${siteConfig.name}-${siteConfig.network}`;
