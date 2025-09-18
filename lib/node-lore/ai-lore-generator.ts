import { generateText, streamText } from "ai";

import type {
  LocationContext,
  LoreGenerationContext,
  LoreGenerationResult,
  LoreLevel,
  LoreAiProvider,
  CosmeticTheme,
  AudioTheme,
  HealthStatus,
} from "@/lib/node-lore/location-lore";
import { LORE_LEVELS } from "@/lib/node-lore/location-lore";
import { siteConfig } from "@/config/site";
import { openrouterModel, xaiModel } from "../utils/ai";

/**
 * AI Lore Generation Service
 * Uses Vercel AI SDK with multiple providers for robust, contextual lore generation
 * Implements sophisticated prompt engineering for HarmonicRealm mythology
 */
export class AILoreGeneratorService {
  private readonly providers = {
    xai: xaiModel,
    openrouter: openrouterModel,
  };

  private readonly defaultProvider: LoreAiProvider =
    siteConfig.network === "testnet" ? "openrouter" : "xai";
  private readonly maxRetries = 3;

  constructor() {}

  /**
   * Generate lore content for a specific level with context awareness
   */
  async generateLore(
    context: LoreGenerationContext,
    options: {
      provider?: LoreAiProvider;
      temperature?: number;
      maxTokens?: number;
      streaming?: boolean;
    } = {}
  ): Promise<LoreGenerationResult> {
    const {
      provider = this.defaultProvider,
      temperature = 0.8,
      maxTokens = 1000,
      streaming = false,
    } = options;

    // Validate target level
    if (!(context.targetLevel in LORE_LEVELS)) {
      throw new AILoreError(
        `Invalid lore level: ${context.targetLevel}`,
        "INVALID_LEVEL",
        context.nodeId
      );
    }

    const levelConfig = LORE_LEVELS[context.targetLevel as LoreLevel];
    const prompt = this.constructPrompt(context, levelConfig);

    let lastError: Error | null = null;

    // Retry logic with provider fallback
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const currentProvider =
          attempt === 0 ? provider : this.getAlternateProvider(provider);

        if (streaming) {
          return await this.generateStreamingLore(
            currentProvider,
            prompt,
            temperature,
            maxTokens
          );
        } else {
          return await this.generateStaticLore(
            currentProvider,
            prompt,
            levelConfig,
            temperature,
            maxTokens
          );
        }
      } catch (error) {
        lastError = error as Error;

        console.warn(`Lore generation attempt ${attempt + 1} failed:`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Wait before retry
        if (attempt < this.maxRetries - 1) {
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw new AILoreError(
      `Lore generation failed after ${this.maxRetries} attempts: ${lastError?.message}`,
      "GENERATION_FAILED",
      context.nodeId
    );
  }

  /**
   * Generate static (non-streaming) lore content
   */
  private async generateStaticLore(
    providerName: LoreAiProvider,
    prompt: string,
    levelConfig: (typeof LORE_LEVELS)[LoreLevel],
    temperature: number,
    maxTokens: number
  ): Promise<LoreGenerationResult> {
    const model = this.providers[providerName];

    const result = await generateText({
      model,
      prompt,
      temperature,
      maxOutputTokens: maxTokens,
    });

    const content = result.text.trim();

    // Validate content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount > levelConfig.maxWords * 1.2) {
      console.warn(
        `Generated content exceeds recommended word limit: ${wordCount}/${levelConfig.maxWords}`
      );
    }

    // Generate cosmetic themes based on content
    const cosmeticThemes = this.generateCosmeticThemes(content);
    const audioThemes = this.generateAudioThemes(content);

    return {
      content,
      cosmeticThemes,
      audioThemes,
      metadata: {
        wordCount,
        generatedAt: new Date(),
        aiModel: `${providerName}-${model.modelId}`,
        promptVersion: "1.0",
      },
    };
  }

  /**
   * Generate streaming lore content (for real-time UI updates)
   */
  private async generateStreamingLore(
    providerName: LoreAiProvider,
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<LoreGenerationResult> {
    const model = this.providers[providerName];

    const result = streamText({
      model,
      prompt,
      temperature,
      maxOutputTokens: maxTokens,
    });

    // Collect streaming content
    let content = "";
    for await (const delta of result.textStream) {
      content += delta;
    }

    content = content.trim();
    const wordCount = content.split(/\s+/).length;
    const cosmeticThemes = this.generateCosmeticThemes(content);
    const audioThemes = this.generateAudioThemes(content);

    return {
      content,
      cosmeticThemes,
      audioThemes,
      metadata: {
        wordCount,
        generatedAt: new Date(),
        aiModel: `${providerName}-${model.modelId}`,
        promptVersion: "1.0",
      },
    };
  }

  /**
   * Construct sophisticated contextual prompt for lore generation
   */
  private constructPrompt(
    context: LoreGenerationContext,
    levelConfig: (typeof LORE_LEVELS)[LoreLevel]
  ): string {
    const { locationContext, targetLevel, previousLore } = context;

    // Base HarmonicRealm mythology context
    const baseContext = `
You are an AI lore master crafting mystical narratives for HarmonicRealm, a geolocation-based adventure game bound to the infinite digits of Pi.

WORLD LORE FOUNDATION:
- The Lattice is a cosmic frequency grid that manifests as geo-anchored Nodes seeded from Pi's infinite digits
- Pioneers (players) resonate with Nodes to mine Shares and uncover ancient mysteries
- Echo Guardians protect sacred locations where reality's mathematical foundations are strongest
- Pi is not just a number—it's the fundamental frequency that binds space, time, and consciousness

LOCATION CONTEXT:
- Coordinates: ${context.coordinates.latitude}, ${context.coordinates.longitude}
- Address: ${locationContext.displayName}
- Country: ${locationContext.address.country || "Unknown"}
- Region: ${
      locationContext.address.state || locationContext.address.city || "Unknown"
    }
- Local Features: ${JSON.stringify(locationContext.extratags)}
`;

    // Level-specific prompting
    const levelPrompts = {
      1: `
TASK: Create Level 1 - Historical Foundation
Write engaging historical context about this location in ${levelConfig.maxWords} words or fewer.

GUIDELINES:
- Focus on factual historical significance, geographical features, and cultural importance
- Use accessible language that respects local heritage
- Connect to broader historical patterns and human civilization
- Maintain scholarly accuracy while being engaging
- End with a subtle hint that this place holds deeper mysteries

TONE: Educational yet intriguing, respectful of local culture
`,
      2: `
TASK: Create Level 2 - Cultural Significance  
Building on this foundation: "${
        previousLore?.basicHistory || "Historical context established"
      }"

Write about cultural significance, local legends, and human connections in ${
        levelConfig.maxWords
      } words or fewer.

GUIDELINES:
- Explore local traditions, folklore, and cultural practices
- Highlight human stories and emotional connections to the place
- Include any mythological or legendary associations
- Show how culture and geography intertwine
- Begin weaving subtle mathematical or mystical undertones

TONE: Culturally respectful, emotionally resonant, slightly mystical
`,
      3: `
TASK: Create Level 3 - Mystic Interpretation
Previous lore: "${previousLore?.basicHistory || ""} ${
        previousLore?.culturalSignificance || ""
      }"

Reinterpret this location through HarmonicRealm's mystical lens in ${
        levelConfig.maxWords
      } words or fewer.

GUIDELINES:
- Connect the location to Pi's infinite nature and the cosmic Lattice
- Introduce the concept that this place resonates with mathematical frequencies
- Suggest ancient peoples sensed something special here
- Weave real geography with mystical Pi-mathematics
- Reference how the location's coordinates emerge from Pi's digits

TONE: Mystical yet grounded, mathematically poetic, awe-inspiring
`,
      4: `
TASK: Create Level 4 - Epic Narrative
Building upon: "${previousLore?.basicHistory || ""} ${
        previousLore?.culturalSignificance || ""
      } ${previousLore?.mysticInterpretation || ""}"

Craft an epic tale that elevates this location into HarmonicRealm mythology in ${
        levelConfig.maxWords
      } words or fewer.

GUIDELINES:
- Create a legendary story connecting this place to the cosmic Lattice's origins
- Introduce Epic-tier concepts: ancient civilizations, cosmic events, reality rifts
- Reference Echo Guardians, Harmonic Awakenings, and interdimensional mathematics
- Make the location feel pivotal to universal harmony
- Include dramatic, cinematic language while maintaining internal consistency

TONE: Epic and grandiose, cosmically significant, cinematic
`,
      5: `
TASK: Create Level 5 - Legendary Transformation
Complete lore foundation: "${previousLore?.basicHistory || ""} ${
        previousLore?.culturalSignificance || ""
      } ${previousLore?.mysticInterpretation || ""} ${
        previousLore?.epicNarrative || ""
      }"

Transform this location into a Legendary site of cosmic importance in ${
        levelConfig.maxWords
      } words or fewer.

GUIDELINES:
- Establish this as one of the most significant locations in the HarmonicRealm universe
- Reference multiversal convergence points, reality anchors, and cosmic significance
- Describe unique phenomena only possible at this legendary location
- Connect to the deepest mysteries of Pi and the nature of reality itself
- Create content worthy of exclusive cosmetic rewards and permanent recognition
- Reference how this location affects the global Lattice network

TONE: Legendary and transcendent, reality-bending, universally significant
`,
    };

    const levelPrompt = levelPrompts[targetLevel as keyof typeof levelPrompts];

    return `${baseContext}\n${levelPrompt}\n\nGenerate the lore content now:`;
  }

  /**
   * Generate cosmetic themes based on lore content
   */
  private generateCosmeticThemes(content: string): CosmeticTheme {
    // Analyze content for thematic elements
    const themes = {
      primaryColors: this.extractColorsFromContent(content),
      secondaryColors: this.getComplementaryColors(),
      effects: this.determineEffects(content),
      ambientSounds: this.suggestAmbientSounds(content),
    };

    return themes;
  }

  /**
   * Generate audio themes based on content analysis
   */
  private generateAudioThemes(content: string): AudioTheme {
    // Analyze content for audio cues
    const baseFrequency = this.calculateBaseFrequency(content);
    const themes = {
      baseFrequency,
      harmonics: this.generateHarmonics(baseFrequency),
      instruments: this.suggestInstruments(content),
    };

    return themes;
  }

  /**
   * Extract color themes from content analysis
   */
  private extractColorsFromContent(content: string): string[] {
    const colorMappings = {
      "gold|golden|amber|sun": ["#FFD700", "#FFA500", "#FF8C00"],
      "blue|ocean|water|sky": ["#1E90FF", "#4169E1", "#0066CC"],
      "green|forest|nature|earth": ["#228B22", "#32CD32", "#006400"],
      "red|fire|blood|passion": ["#DC143C", "#B22222", "#8B0000"],
      "purple|mystical|magic|cosmic": ["#9370DB", "#8A2BE2", "#4B0082"],
      "silver|moon|lunar|ethereal": ["#C0C0C0", "#D3D3D3", "#A9A9A9"],
    };

    const colors: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const [keywords, colorSet] of Object.entries(colorMappings)) {
      if (new RegExp(keywords).test(lowerContent)) {
        colors.push(...colorSet);
      }
    }

    return colors.length > 0
      ? colors.slice(0, 3)
      : ["#4A90E2", "#7B68EE", "#9370DB"];
  }

  /**
   * Generate complementary colors for secondary themes
   */
  private getComplementaryColors(): string[] {
    return ["#F5F5DC", "#E6E6FA", "#F0F8FF"]; // Neutral complementary colors
  }

  /**
   * Determine visual effects based on lore level and content
   */
  private determineEffects(content: string): string[] {
    const baseEffects = ["particle-glow", "subtle-pulse"];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("legendary") || lowerContent.includes("cosmic")) {
      baseEffects.push("cosmic-swirl", "reality-distortion");
    }
    if (lowerContent.includes("ancient") || lowerContent.includes("temple")) {
      baseEffects.push("ancient-runes", "energy-emanation");
    }
    if (lowerContent.includes("water") || lowerContent.includes("ocean")) {
      baseEffects.push("water-ripples", "flowing-energy");
    }

    return baseEffects;
  }

  /**
   * Suggest ambient sounds based on content
   */
  private suggestAmbientSounds(content: string): string[] {
    const soundMappings = {
      "forest|tree|nature": ["forest-ambience", "wind-through-trees"],
      "water|ocean|river|lake": ["water-lapping", "distant-waves"],
      "mountain|peak|cliff": ["mountain-wind", "distant-echo"],
      "city|urban|street": ["distant-traffic", "urban-hum"],
      "ancient|temple|ruins": ["stone-resonance", "mystical-hum"],
      "cosmic|space|star": ["cosmic-radiation", "stellar-harmony"],
    };

    const sounds: string[] = ["harmonic-resonance"]; // Base HarmonicRealm sound
    const lowerContent = content.toLowerCase();

    for (const [keywords, soundSet] of Object.entries(soundMappings)) {
      if (new RegExp(keywords).test(lowerContent)) {
        sounds.push(...soundSet);
        break; // Only add one environmental sound set
      }
    }

    return sounds;
  }

  /**
   * Calculate base frequency from content (for audio themes)
   */
  private calculateBaseFrequency(content: string): number {
    // Use content hash to derive consistent frequency
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Map to musical frequency range (200-800 Hz)
    return 200 + Math.abs(hash % 600);
  }

  /**
   * Generate harmonic frequencies
   */
  private generateHarmonics(baseFrequency: number): number[] {
    return [
      baseFrequency * 1.5, // Perfect fifth
      baseFrequency * 2, // Octave
      baseFrequency * 2.5, // Major tenth
    ];
  }

  /**
   * Suggest instruments based on content themes
   */
  private suggestInstruments(content: string): string[] {
    const instrumentMappings = {
      "ancient|temple|mystical": ["tibetan-bowls", "hang-drum"],
      "nature|forest|earth": ["flute", "nature-sounds"],
      "water|ocean": ["rain-stick", "crystal-bowls"],
      "cosmic|space|legendary": ["synthesizer", "ambient-pad"],
      "epic|grand|magnificent": ["orchestral-strings", "brass"],
    };

    const instruments = ["harmonic-drone"]; // Base instrument
    const lowerContent = content.toLowerCase();

    for (const [keywords, instrumentSet] of Object.entries(
      instrumentMappings
    )) {
      if (new RegExp(keywords).test(lowerContent)) {
        instruments.push(...instrumentSet);
        break;
      }
    }

    return instruments;
  }

  /**
   * Get alternate provider for fallback
   */
  private getAlternateProvider(primary: LoreAiProvider): LoreAiProvider {
    return primary === "openrouter" ? "xai" : "openrouter";
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: unknown): boolean {
    // Don't retry on authentication or quota errors
    if (error instanceof Error) {
      if (
        error.message?.includes("API key") ||
        error.message?.includes("quota")
      ) {
        return true;
      }

      // Don't retry on content policy violations
      if (
        error.message?.includes("content policy") ||
        error.message?.includes("safety")
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate generated content quality
   */
  validateLoreQuality(
    content: string,
    targetLevel: number,
    locationContext: LocationContext
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const levelConfig = LORE_LEVELS[targetLevel as LoreLevel];

    // Check word count
    const wordCount = content.split(/\s+/).length;
    if (wordCount > levelConfig.maxWords * 1.2) {
      issues.push(
        `Content too long: ${wordCount}/${levelConfig.maxWords} words`
      );
    }

    if (wordCount < levelConfig.maxWords * 0.5) {
      issues.push(
        `Content too short: ${wordCount}/${levelConfig.maxWords} words`
      );
    }

    // Check for location relevance
    const locationTerms = [
      locationContext.address.country?.toLowerCase(),
      locationContext.address.state?.toLowerCase(),
      locationContext.address.city?.toLowerCase(),
    ].filter(Boolean);

    const contentLower = content.toLowerCase();
    const hasLocationReference = locationTerms.some(
      (term) => term && contentLower.includes(term)
    );

    if (!hasLocationReference && targetLevel <= 2) {
      issues.push("Content should reference the specific location");
    }

    // Check for HarmonicRealm terminology (levels 3+)
    if (targetLevel >= 3) {
      const harmonicrealmTerms = [
        "lattice",
        "pi",
        "harmonic",
        "resonance",
        "echo",
      ];
      const hasTerminology = harmonicrealmTerms.some((term) =>
        contentLower.includes(term)
      );

      if (!hasTerminology) {
        issues.push("Content should include HarmonicRealm terminology");
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const status: HealthStatus = {
      status: "healthy",
      providers: {},
      details: [],
    };

    // Test each provider
    for (const [name, model] of Object.entries(this.providers)) {
      try {
        // Quick test generation
        await generateText({
          model,
          prompt: 'Test message. Respond with "OK".',
          maxOutputTokens: 10,
        });

        status.providers[name] = true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Provider Error";
        status.providers[name] = false;
        status.details.push(`${name}: ${errorMessage}`);
      }
    }

    // Determine overall status
    const workingProviders = Object.values(status.providers).filter(
      Boolean
    ).length;
    if (workingProviders === 0) {
      status.status = "unhealthy";
    } else if (workingProviders < Object.keys(this.providers).length) {
      status.status = "degraded";
    }

    return status;
  }
}

/**
 * Custom error class for AI lore generation
 */
export class AILoreError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_LEVEL"
      | "GENERATION_FAILED"
      | "CONTENT_POLICY_VIOLATION"
      | "API_ERROR"
      | "TIMEOUT"
      | "VALIDATION_FAILED",
    public readonly nodeId?: string
  ) {
    super(message);
    this.name = "AILoreError";
  }
}

// Singleton instance
export const aiLoreGenerator = new AILoreGeneratorService();
