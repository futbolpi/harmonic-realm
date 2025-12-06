import Decimal from "decimal.js";

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
    twitter: "https://x.com/HarmonicRealmPi",
    github: "https://github.com/futbolpi/harmonic-realm",
    telegram: "https://t.me/HarmonicRealm",
  },
};

export const SiteId = siteConfig.name;

// Mining constants
export const MINING_RANGE_METERS = 100; // Distance in meters user must be within to mine
export const LOCATION_UPDATE_INTERVAL = 5000; // Update location every 5 seconds
export const SESSION_REFETCH_INTERVAL = 10000; // Refetch session every 10 seconds when active

export const GENESIS_THRESHOLD = siteConfig.network === "testnet" ? 1 : 100;

export const FLOOR_PRICE = new Decimal("0.314");

export const BASE_XP = 10;

export const videoLinks = {
  hero: {
    url: "https://youtu.be/PgVQgTbue-g",
    title: "HarmonicRealm: A Geolocation Adventure Bound to Pi",
  },
  resonantHelper: {
    url: "https://youtu.be/YyflnWGrjAc",
    title: "How to Anchor Your Own Node & Use Fidelity Discounts",
  },
  calibrationHelper: {
    url: "https://youtu.be/OjxqQX-GbdE",
    title: "Lattice Calibration Explained",
  },
  mapHelper: {
    url: "https://youtu.be/c8xg0RLSURw",
    title: "World Map Navigation",
  },
  nodeDetailsHelper: {
    url: "https://youtu.be/jw33VDe4HzU",
    title: "Node Detail, Resonance Mining, and Daily Tuning Guide",
  },
};

export const NODE_TUNING_DAILY_CAP = 5;
export const TUNING_STREAK_REQ_DAYS = 5;
export const TUNING_STREAK_REWARD = 3;

// Landlord tax (3%) applied to tuning shares earned if node has a sponsor
export const LANDLORD_TAX_RATE = 0.03;
