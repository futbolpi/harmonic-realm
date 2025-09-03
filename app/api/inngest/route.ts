import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { cosmicHeraldAnnouncement } from "@/inngest/workflows/announcements/cosmic-herald-announcement";
import { phaseCompletedWorkflow } from "@/inngest/workflows/phases/phase-completed-workflow";
import { achievementUnlockWorkflow } from "@/inngest/workflows/achievements/achievement-unlock-workflow";
import { generateInitialPhase } from "@/inngest/workflows/phases/initial-phase-workflow";
import { generateNextPhase } from "@/inngest/workflows/phases/threshold-phase-workflow";
import { generateLocationLore } from "@/inngest/workflows/location-lores/generate-location-lore";
import { appToUserPayment } from "@/inngest/workflows/payments/app-to-user";

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
  ],
});
