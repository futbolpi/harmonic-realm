import type {
  ChallengeDifficulty,
  ChallengeGoalType,
} from "@/lib/generated/prisma/enums";

type Template = {
  difficulty: ChallengeDifficulty;
  id: string;
  name: string;
  description: string;
  goalType: ChallengeGoalType;
  targetValue: number;
  minMembers: number;
  resonanceReward: number;
  prestigeReward: number;
  loreText: string;
  icon: string;
};

/**
 * Generates a tailored Telegram announcement for challenge spawn event
 * uses all WEEKLY challenge templates and formats them with full details
 */
export function generateSpawnChallengesAnnouncement(
  templates: Template[]
): string {
  if (templates.length === 0) {
    return "⚠️ No weekly challenges available this cycle.";
  }

  // Build challenge list dynamically with template details
  const challengesList = templates
    .map((template) => {
      return `<b>${template.icon} ${template.name}</b>\n${template.description}\n<i>Requires: ${template.minMembers}+ members</i>\n💰 ${template.resonanceReward} RESONANCE | ⭐ ${template.prestigeReward} Prestige`;
    })
    .join("\n\n");

  const difficultyStats = getDifficultyDistribution(templates);

  return `
<b>🎪 HARMONIC REALM: WEEKLY CHALLENGES SPAWNED 🎪</b>

The Lattice Council has woven new trials into the fabric of reality. <b>${templates.length} challenges</b> now beckon to all Guilds with sufficient vault resonance.

<b>📊 Difficulty Distribution:</b>
${difficultyStats}

<b>🏆 Available Challenges:</b>
${challengesList}

<b>⚡ How to Participate:</b>
Guilds with Vault Level 3+ can accept these challenges. Each accepted challenge runs for <b>7 days</b> from spawn. Work together, sync your frequencies, and claim your rewards!

May your resonance guide you. <i>—The Lattice Council</i>
  `.trim();
}

/**
 * Generates a tailored Telegram announcement for challenge completion
 * Includes lore-themed narrative and personalized guild/challenge details
 */
export async function generateCompleteChallengeAnnouncement(
  guildName: string,
  challengeName: string,
  resonanceReward: number,
  prestigeReward: number
): Promise<string> {
  return `
<b>🌟 CHALLENGE COMPLETE: ${challengeName.toUpperCase()} 🌟</b>

The guild <b>${guildName}</b> has successfully conquered the challenge: <b>${challengeName}</b>

<b>Rewards Distributed:</b>
💰 <b>${resonanceReward}</b> RESONANCE 
⭐ <b>${prestigeReward}</b> Prestige points

The Lattice acknowledges your triumph. Your synchronized frequencies have strengthened the collective resonance. May this victory inspire your next ascent!

<i>—The Harmony Keeper</i>
  `.trim();
}

/**
 * Helper function to describe goal types in human-readable format
 */
export function getGoalTypeDescription(
  goalType: string,
  targetValue: number
): string {
  const descriptions: Record<string, string> = {
    TOTAL_SHAREPOINTS: `Earn ${targetValue.toLocaleString()} collective Share Points`,
    UNIQUE_NODES_MINED: `Mine ${targetValue} unique node types`,
    PERFECT_TUNES: `Achieve ${targetValue} perfect tuning sessions (100/100)`,
    TERRITORY_CAPTURED: `Win ${targetValue} territory challenges`,
    VAULT_CONTRIBUTIONS: `Deposit ${targetValue.toLocaleString()} RESONANCE to shared vault`,
    MEMBER_STREAKS: `Get ${targetValue}+ members with 5+ day streaks`,
  };
  return descriptions[goalType] || "Unknown goal";
}

/**
 * Helper function to calculate and format difficulty distribution stats
 */
function getDifficultyDistribution(
  templates: Array<{ difficulty: ChallengeDifficulty }>
): string {
  const distribution = templates.reduce((acc, t) => {
    acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<ChallengeDifficulty, number>);

  const difficultyEmojis: Record<ChallengeDifficulty, string> = {
    EASY: "🟢",
    MEDIUM: "🟡",
    HARD: "🔴",
    BRUTAL: "⚡",
  };

  return (Object.entries(distribution) as [ChallengeDifficulty, number][])
    .map(([difficulty, count]) => {
      return `${
        difficultyEmojis[difficulty] || "•"
      } ${difficulty}: ${count} challenge${count !== 1 ? "s" : ""}`;
    })
    .join("\n");
}
