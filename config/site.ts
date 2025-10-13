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
  description: string;
  network: "testnet" | "mainnet";
  links: {
    twitter: string;
    github: string;
    telegram: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "HarmonicRealm",
  description:
    "Turn real-world exploration into a Shares mining adventure. Discover nodes, mine Shares, and earn rewards in this location-based game.",
  id: "harmonic-realm",
  network: env.NEXT_PUBLIC_PI_EXPLORER_LINK.includes("testnet")
    ? "testnet"
    : "mainnet",
  links: {
    twitter: "https://x.com/MitimaraPi",
    github: "https://github.com/futbolpi/harmonic-realm",
    telegram: "https://t.me/HarmonicRealm",
  },
};

export const SiteId = siteConfig.name;

// Mining constants
export const MINING_RANGE_METERS = 100; // Distance in meters user must be within to mine
export const LOCATION_UPDATE_INTERVAL = 5000; // Update location every 5 seconds
export const SESSION_REFETCH_INTERVAL = 10000; // Refetch session every 10 seconds when active

export const GENESIS_THRESHOLD = siteConfig.network === "testnet" ? 1 : 50;
