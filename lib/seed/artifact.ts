import type {
  ArtifactEffectType,
  ArtifactRarity,
} from "../generated/prisma/enums";

/**
 * Template definitions (seed data)
 */
export const ARTIFACT_TEMPLATES = {
  HARMONIC_AMPLIFIER: {
    name: "Harmonic Amplifier",
    effectType: "SHAREPOINT_BONUS" as ArtifactEffectType,
    baseValue: 0.03, // 3%
    valuePerLevel: 0.012, // +1.2% per level
    echoShardsCost: 50,
    resonanceCost: 200,
    minVaultLevel: 3,
    rarity: "COMMON" as ArtifactRarity,
    description: "Amplifies share points earned by all guild members",
    loreText:
      "The Harmonic Amplifier resonates with the guild's collective frequency, multiplying their resonance harvest.",
  },

  RESONANCE_LENS: {
    name: "Resonance Lens",
    effectType: "TUNING_QUALITY" as ArtifactEffectType,
    baseValue: 0.05, // 5%
    valuePerLevel: 0.0167, // +1.67% per level (~20% at level 10)
    echoShardsCost: 75,
    resonanceCost: 300,
    minVaultLevel: 3,
    rarity: "COMMON" as ArtifactRarity,
    description: "Increases chance of perfect tuning sessions",
    loreText:
      "Through this crystalline lens, the Lattice's frequency becomes crystalline clarity.",
  },

  TEMPORAL_ECHO: {
    name: "Temporal Echo",
    effectType: "MINING_SPEED" as ArtifactEffectType,
    baseValue: -0.05, // -5% cooldown
    valuePerLevel: -0.0167, // -1.67% per level (~-20% at level 10)
    echoShardsCost: 100,
    resonanceCost: 400,
    minVaultLevel: 3,
    rarity: "RARE" as ArtifactRarity,
    description: "Reduces mining cooldown for all members",
    loreText:
      "Echoing across time, this artifact accelerates the guild's connection to the Lattice.",
  },

  VAULT_MAGNETAR: {
    name: "Vault Magnetar",
    effectType: "VAULT_EFFICIENCY" as ArtifactEffectType,
    baseValue: 0.1, // 10%
    valuePerLevel: 0.02, // +2% per level
    echoShardsCost: 60,
    resonanceCost: 250,
    minVaultLevel: 4,
    rarity: "RARE" as ArtifactRarity,
    description: "Increases vault rewards distribution",
    loreText:
      "A stellar singularity that pulls resonance into the guild's repository.",
  },

  PRESTIGE_PRISM: {
    name: "Prestige Prism",
    effectType: "PRESTIGE_GAIN" as ArtifactEffectType,
    baseValue: 0.08, // 8%
    valuePerLevel: 0.0189, // +1.89% per level (~25% at level 10)
    echoShardsCost: 80,
    resonanceCost: 350,
    minVaultLevel: 5,
    rarity: "EPIC" as ArtifactRarity,
    description: "Amplifies prestige gained from all sources",
    loreText:
      "Fractured light of legendary deeds, this prism magnifies the guild's honor.",
  },

  TERRITORIAL_AEGIS: {
    name: "Territorial Aegis",
    effectType: "TERRITORY_DEFENSE" as ArtifactEffectType,
    baseValue: 0.1, // 10%
    valuePerLevel: 0.03, // +3% per level
    echoShardsCost: 120,
    resonanceCost: 500,
    minVaultLevel: 6,
    rarity: "EPIC" as ArtifactRarity,
    description: "Strengthens defense in territorial wars",
    loreText:
      "An impenetrable shield forged from crystallized victories, protecting the guild's dominion.",
  },
} as const;
