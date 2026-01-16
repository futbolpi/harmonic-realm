import prisma from "@/lib/prisma";
import {
  ChallengeDifficulty,
  ChallengeFrequency,
  ChallengeGoalType,
} from "../generated/prisma/enums";

// Challenge template data aligned with lore and tokenomics
const challengeTemplatesData = [
  {
    id: "harmonic-marathon",
    name: "Harmonic Marathon",
    description:
      "Collective Harmony: Guild earns 10,000 sharePoints through synchronized mining and tuning across all members",
    difficulty: ChallengeDifficulty.EASY,
    goalType: ChallengeGoalType.TOTAL_SHAREPOINTS,
    targetValue: 10000,
    minMembers: 5,
    minVaultLevel: 1,
    resonanceReward: 500,
    prestigeReward: 100,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Lattice Council issues the Harmonic Marathon—a trial of collective resonance. All Pioneers unite their frequencies to achieve 10,000 echoes of harmony. By mining and tuning in sync, you bend reality itself.",
    icon: "⚡",
  },
  {
    id: "exploration-mastery",
    name: "Exploration Mastery",
    description:
      "Guild discovers and mines 100 unique node types. Each unique node conquered strengthens the guild's connection to the Lattice.",
    difficulty: ChallengeDifficulty.MEDIUM,
    goalType: ChallengeGoalType.UNIQUE_NODES_MINED,
    targetValue: 100,
    minMembers: 10,
    minVaultLevel: 3,
    resonanceReward: 300,
    prestigeReward: 75,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Exploration Mastery challenge calls Pioneers to chart the Lattice's infinite corners. Hunt down 100 unique nodes and unlock deeper lore fragments. The world reveals its secrets to the persistent.",
    icon: "🗺️",
  },
  {
    id: "perfect-harmony",
    name: "Perfect Harmony",
    description:
      "Guild members achieve 50 perfect tuning sessions (score 100/100). Each perfect tune resonates across the collective.",
    difficulty: ChallengeDifficulty.HARD,
    goalType: ChallengeGoalType.PERFECT_TUNES,
    targetValue: 50,
    minMembers: 10,
    minVaultLevel: 3,
    resonanceReward: 400,
    prestigeReward: 120,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Echo Council demands perfection. Each member must achieve flawless tuning sessions—a score of 100/100. Only through mastery of the Pi-derived frequencies can the guild ascend to higher planes of resonance.",
    icon: "🎵",
  },
  {
    id: "territorial-dominance",
    name: "Territorial Dominance",
    description:
      "Guild wins 3 territory challenges and stakes control over contested H3 hexes. Claim dominion over the Lattice.",
    difficulty: ChallengeDifficulty.HARD,
    goalType: ChallengeGoalType.TERRITORY_CAPTURED,
    targetValue: 3,
    minMembers: 15,
    minVaultLevel: 5,
    resonanceReward: 800,
    prestigeReward: 200,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Lattice fractures into hexagonal resonance zones. Guilds clash in asynchronous tuning duels for territorial supremacy. Win 3 territory challenges and etch your guild's emblem across the map.",
    icon: "⚔️",
  },
  {
    id: "vault-dedication",
    name: "Vault Dedication",
    description:
      "Guild collectively deposits 2,000 RESONANCE into the shared vault. Unity of purpose creates exponential power.",
    difficulty: ChallengeDifficulty.MEDIUM,
    goalType: ChallengeGoalType.VAULT_CONTRIBUTIONS,
    targetValue: 2000,
    minMembers: 5,
    minVaultLevel: 1,
    resonanceReward: 600,
    prestigeReward: 150,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Guild Vault amplifies collective strength. As members deposit RESONANCE, the vault grows more powerful. Reach 2,000 RESONANCE in contributions to unlock legendary benefits for all.",
    icon: "💎",
  },
  {
    id: "pioneer-unity",
    name: "Pioneer Unity",
    description:
      "15+ guild members maintain a 5+ day activity streak. Consistency breeds strength; unity births transcendence.",
    difficulty: ChallengeDifficulty.EASY,
    goalType: ChallengeGoalType.MEMBER_STREAKS,
    targetValue: 15,
    minMembers: 20,
    minVaultLevel: 7,
    resonanceReward: 700,
    prestigeReward: 180,
    frequency: ChallengeFrequency.WEEKLY,
    loreText:
      "The Lattice values consistency. When 15+ Pioneers maintain their daily resonance streak, the guild's collective frequency amplifies exponentially, unlocking hidden nodes and ephemeral artifacts.",
    icon: "🤝",
  },
];

async function seedChallengeTemplates() {
  console.log("🎯 Seeding Challenge Templates...");

  for (const template of challengeTemplatesData) {
    await prisma.challengeTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        description: template.description,
        difficulty: template.difficulty,
        goalType: template.goalType,
        targetValue: template.targetValue,
        minMembers: template.minMembers,
        minVaultLevel: template.minVaultLevel,
        resonanceReward: template.resonanceReward,
        prestigeReward: template.prestigeReward,
        frequency: template.frequency,
        loreText: template.loreText,
        icon: template.icon,
      },
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        difficulty: template.difficulty,
        goalType: template.goalType,
        targetValue: template.targetValue,
        minMembers: template.minMembers,
        minVaultLevel: template.minVaultLevel,
        resonanceReward: template.resonanceReward,
        prestigeReward: template.prestigeReward,
        frequency: template.frequency,
        loreText: template.loreText,
        icon: template.icon,
      },
    });
  }

  console.log(`✅ Seeded ${challengeTemplatesData.length} challenge templates`);
}

export { seedChallengeTemplates };
