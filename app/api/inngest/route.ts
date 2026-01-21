import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { cosmicHeraldAnnouncement } from "@/inngest/workflows/announcements/cosmic-herald-announcement";
import { phaseCompletedWorkflow } from "@/inngest/workflows/phases/phase-completed-workflow";
import { achievementUnlockWorkflow } from "@/inngest/workflows/achievements/achievement-unlock-workflow";
import { generateInitialPhase } from "@/inngest/workflows/phases/initial-phase-workflow";
import { generateNextPhase } from "@/inngest/workflows/phases/threshold-phase-workflow";
import { generateLocationLore } from "@/inngest/workflows/location-lores/generate-location-lore";
import { appToUserPayment } from "@/inngest/workflows/payments/app-to-user";
import { loreGenerationHealthCheck } from "@/inngest/workflows/location-lores/lore-generation-health-check";
import { calibrationTriggeredWorkflow } from "@/inngest/workflows/phases/calibration-triggered-workflow";
import { distributeWeeklyRewards } from "@/inngest/workflows/guilds/distribute-weekly-rewards";
import { dailyCleanUp } from "@/inngest/workflows/site/daily-cleanup";
import { resolveChallengeOnStart } from "@/inngest/workflows/territories/resolve-challenge-on-start";
import { resolveExpiredChallengesCron } from "@/inngest/workflows/territories/resolve-expired-challenges-cron";
import { recomputeTrafficScores } from "@/inngest/workflows/territories/recompute-traffic-scores";
import {
  territoryClaimedScheduler,
  expireTerritoriesCron,
} from "@/inngest/workflows/territories/expire-territories";
import { spawnWeeklyChallenges } from "@/inngest/workflows/guilds/challenges/spawn-weekly-challenges";
import { completeChallengeWorkflow } from "@/inngest/workflows/guilds/challenges/complete-challenge-workflow";
import { applyPrestigeDecayWorkflow } from "@/inngest/workflows/guilds/prestige/apply-prestige-decay";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    cosmicHeraldAnnouncement,
    phaseCompletedWorkflow,
    achievementUnlockWorkflow,
    generateInitialPhase,
    generateNextPhase,
    generateLocationLore,
    appToUserPayment,
    loreGenerationHealthCheck,
    calibrationTriggeredWorkflow,
    // Guild workflows
    // Distribute weekly guild vault rewards (Mon 00:00 UTC)
    distributeWeeklyRewards,
    // Site workflows
    dailyCleanUp,

    // Territory workflows
    resolveChallengeOnStart,
    resolveExpiredChallengesCron,
    recomputeTrafficScores,
    territoryClaimedScheduler,
    expireTerritoriesCron,

    // Challenge workflows
    spawnWeeklyChallenges,
    completeChallengeWorkflow,

    applyPrestigeDecayWorkflow,
  ],
});
