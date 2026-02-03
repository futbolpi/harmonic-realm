declare global {
  namespace PrismaJson {
    // Define a type for a user's profile information.
    type LocationContext = {
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
    };

    type CosmeticTheme = {
      primaryColors: string[];
      secondaryColors: string[];
      effects: string[];
      ambientSounds: string[];
    };

    type AudioTheme = {
      baseFrequency: number;
      harmonics: number[];
      instruments: string[];
    };

    type MemberContributions = Record<string, number>;

    type PrestigeLogMetadata = {
      challengeId?: string;
      progressId?: string;
      memberId?: string;
      amount?: number;
      reason?: string;
      decayReason?: "INACTIVITY" | "CHALLENGE_LOSS";
      previousLevel?: number;
      newLevel?: number;
      activeMembersCount?: number;
      decayRate?: number;
    };
  }
}

// This file must be a module, so we include an empty export.
export {};
