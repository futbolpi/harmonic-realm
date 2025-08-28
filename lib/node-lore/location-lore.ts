import { Coins, LucideProps, Sparkles, Star, Users } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

import { ContributionTier } from "@/lib/generated/prisma/enums";

// ====== LOCATION IQ API TYPES ======

export interface LocationIQReverseResponse {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  namedetails?: {
    name?: string;
    [key: string]: string | undefined;
  };
  extratags?: {
    [key: string]: string;
  };
  importance?: number;
}

export interface LocationContext {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    country?: string;
    state?: string;
    city?: string;
    district?: string;
    road?: string;
    postcode?: string;
  };
  displayName: string;
  importance: number;
  extratags: Record<string, string>;
}

export interface CosmeticTheme {
  primaryColors: string[];
  secondaryColors: string[];
  effects: string[];
  ambientSounds: string[];
}

export interface AudioTheme {
  baseFrequency: number;
  harmonics: number[];
  instruments: string[];
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  providers: Record<string, boolean>;
  details: string[];
}

// ====== LORE GENERATION TYPES ======

export interface LoreGenerationContext {
  nodeId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  locationContext: LocationContext;
  targetLevel: number;
  previousLore?: {
    basicHistory?: string;
    culturalSignificance?: string;
    mysticInterpretation?: string;
    epicNarrative?: string;
  };
}

export interface LoreGenerationResult {
  content: string;
  cosmeticThemes?: {
    primaryColors: string[];
    secondaryColors: string[];
    effects: string[];
    ambientSounds: string[];
  };
  audioThemes?: {
    baseFrequency: number;
    harmonics: number[];
    instruments: string[];
  };
  metadata: {
    wordCount: number;
    generatedAt: Date;
    aiModel: string;
    promptVersion: string;
  };
}

// ====== LORE LEVEL DEFINITIONS ======

export const LORE_LEVELS = {
  1: {
    name: "Historical Foundation",
    totalRequired: undefined,
    piRequired: 0.5,
    description: "Basic location history and geographical context",
    maxWords: 150,
  },
  2: {
    name: "Cultural Significance",
    piRequired: 2.0,
    totalRequired: 2.0,
    description: "Cultural importance, local legends, historical events",
    maxWords: 300,
  },
  3: {
    name: "Mystic Interpretation",
    piRequired: 3.0,
    totalRequired: 5.0,
    description: "Mystical reinterpretation connecting location to cosmic Pi",
    maxWords: 400,
  },
  4: {
    name: "Epic Narrative",
    piRequired: 5.0,
    totalRequired: 10.0,
    description: "Epic tale weaving location into Lattice mythology",
    maxWords: 600,
  },
  5: {
    name: "Legendary Transformation",
    piRequired: 10.0,
    totalRequired: 20.0,
    description: "Legendary transformation with exclusive cosmetics",
    maxWords: 800,
  },
} as const;

export type LoreLevel = keyof typeof LORE_LEVELS;

export type LoreAiProvider = "openrouter" | "xai";

// ====== CONTRIBUTION TIERS ======

type ContributionTiers = Record<
  ContributionTier,
  {
    minPi: number;
    name: string;
    benefits: string[];
    badge: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    color: string;
  }
>;

export const CONTRIBUTION_TIERS: ContributionTiers = {
  ECHO_SUPPORTER: {
    minPi: 0.1,
    name: "Echo Supporter",
    benefits: ["Early access to new Node types"],
    badge: "🔮",
    icon: Sparkles,
    color: "text-neon-blue",
  },
  RESONANCE_PATRON: {
    minPi: 1.0,
    name: "Resonance Patron",
    benefits: ["Exclusive phase cosmetics", "Permanent recognition"],
    badge: "🌟",
    icon: Users,
    color: "text-neon-purple",
  },
  LATTICE_ARCHITECT: {
    minPi: 10.0,
    name: "Lattice Architect",
    benefits: ["Name in phase lore", "Rare Node spawn priority"],
    badge: "⚡",
    icon: Star,
    color: "text-neon-green",
  },
  COSMIC_FOUNDER: {
    minPi: 50.0,
    name: "Cosmic Founder",
    benefits: ["Permanent monument", "Exclusive title", "Beta access"],
    badge: "👑",
    icon: Coins,
    color: "text-neon-pink",
  },
} as const;

// ====== API RESPONSE TYPES ======

export interface LocationLoreResponse {
  nodeId: string;
  currentLevel: number;
  totalPiStaked: number;
  loreContent: {
    basicHistory?: string;
    culturalSignificance?: string;
    mysticInterpretation?: string;
    epicNarrative?: string;
    legendaryTale?: string;
  };
  cosmeticThemes?: {
    primaryColors: string[];
    effects: string[];
  };
  contributors: {
    userId: string;
    username: string;
    piContributed: number;
    tier: ContributionTier;
  }[];
  nextLevelRequirement?: {
    level: number;
    piRequired: number;
    currentProgress: number;
  };
}

export interface StakingOpportunity {
  nodeId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  currentLevel: number;
  totalStaked: number;
  nextLevel: {
    level: number;
    piRequired: number;
    description: string;
  };
  estimatedCompletionTime: string; // e.g., "2-4 hours"
}
