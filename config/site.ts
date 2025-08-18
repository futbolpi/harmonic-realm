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
  name: "HarmonicRealm",
  id: "harmonic-realm",
  network: env.NEXT_PUBLIC_PI_EXPLORER_LINK.includes("testnet")
    ? "testnet"
    : "mainnet",
};

export const SiteId = `${siteConfig.name}-${siteConfig.network}`;

// Mining constants
export const MINING_RANGE_METERS = 100; // Distance in meters user must be within to mine
export const LOCATION_UPDATE_INTERVAL = 5000; // Update location every 5 seconds
export const SESSION_REFETCH_INTERVAL = 10000; // Refetch session every 10 seconds when active
