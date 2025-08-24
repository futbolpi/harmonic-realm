import { MasteryInfoResponse } from "@/lib/schema/mastery";
import {
  calculateMasteryThresholds,
  getSessionsToNextLevel,
} from "@/lib/utils/mastery";

export const defaultSessionMastery: MasteryInfoResponse = {
  availableThresholds: calculateMasteryThresholds(),
  mastery: null,
  progressInfo: getSessionsToNextLevel(0),
};
