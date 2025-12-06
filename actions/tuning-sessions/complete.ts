"use server";

import { revalidatePath } from "next/cache";
import { differenceInCalendarDays } from "date-fns";

import {
  TuningSubmissionParams,
  TuningSubmissionSchema,
} from "@/lib/schema/tuning-session";
import type { ApiResponse } from "@/lib/schema/api";
import { verifyTokenAndGetUser } from "@/lib/api-helpers/server/users";
import { checkTuningEligibility } from "@/lib/api-helpers/server/tuning-sessions";
import prisma from "@/lib/prisma";
import {
  TUNING_STREAK_REQ_DAYS,
  TUNING_STREAK_REWARD,
  LANDLORD_TAX_RATE,
} from "@/config/site";
import { validateGeolocation } from "@/lib/api-helpers/server/utils/validate-geolocation";

type SucessResponse = {
  shares: number;
  referralPoints: number;
  currentStreak: number;
  milestoneReached: boolean;
  // Tax breakdown for UI transparency
  grossShares?: number;
  landlordTax?: number;
};

/**
 * Processes game results with Rarity and 5-Day Milestone Logic.
 */
export async function submitTuningSession(
  params: TuningSubmissionParams
): Promise<ApiResponse<SucessResponse>> {
  try {
    const { success, data } = TuningSubmissionSchema.safeParse(params);

    if (!success) {
      return { success: false, error: "Invalid Request" };
    }

    const { accessToken, accuracyScore, nodeId, userLat, userLng } = data;

    // Validate against spoofing
    const isValid = await validateGeolocation(userLat, userLng);

    if (!isValid) {
      return {
        success: false,
        error: "Forbidden: Location verification failed",
      };
    }

    // Verify user authentication
    const { id: userId, piId } = await verifyTokenAndGetUser(accessToken);

    // Fetch eligibility AND rarity
    const validation = await checkTuningEligibility({
      nodeId,
      userId,
      userLat,
      userLng,
    });

    if (!validation.eligible || validation.baseYield === undefined) {
      return { success: false, error: validation.reason };
    }

    const now = new Date();

    // --- 1. Calculate Shares (Rarity Based using the baseYieldPerMinute) ---
    // Formula: node baseYieldPerMinute% * Accuracy%
    // Example: Legendary Node (2167) with 90% accuracy = 21.67 * 0.9 = 19.5 Shares
    // Example: Common Node (650) with 50% accuracy = 6.5 * 0.5 = 3.25 Shares

    const accuracyFactor = accuracyScore / 100;
    const baseFactor = validation.baseYield / 100;

    const sharesReward = baseFactor * accuracyFactor;

    // --- 1.5. Calculate Landlord Tax (3% if node has a sponsor) ---
    // Efficiency: Only query node's sponsor if we have shares to tax.
    // This avoids unnecessary DB hits for low-earning sessions.
    let landlordTax = 0;
    // grossShares: the raw shares earned before any tax
    const grossShares = parseFloat(sharesReward.toFixed(4));
    // netShares: the shares after landlord tax (what the player actually receives)
    let netShares = grossShares;
    let taxApplies = false;

    // Only apply tax if shares earned > 0 (avoids pointless calculations)
    if (sharesReward > 0) {
      // Check: Node has sponsor AND sponsor is not the playing user (no self-tax)
      taxApplies = !!validation.sponsorPiId && validation.sponsorPiId !== piId;

      if (taxApplies) {
        // Tax = 3% of earned shares
        landlordTax = parseFloat((sharesReward * LANDLORD_TAX_RATE).toFixed(4));
        // Net shares after tax
        netShares = parseFloat((sharesReward - landlordTax).toFixed(4));
      }
    }

    // --- 2. Calculate Milestone Streak (Retention Logic) ---
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, dailyStreak: true, lastTunedAt: true },
    });

    if (!user) {
      return { success: false, error: "Invalid Request" };
    }

    let newStreak = user.dailyStreak;
    let earnedReferralPoints = 0;
    let milestoneReached = false;

    const lastTunedDate = user.lastTunedAt;
    const daysDiff = lastTunedDate
      ? differenceInCalendarDays(now, lastTunedDate)
      : 999;

    if (daysDiff === 0) {
      // Same day play: No streak update, No referral points
      milestoneReached = false;
    } else if (daysDiff === 1) {
      // Consecutive day: Increment
      newStreak += 1;
    } else {
      // Broken streak: Reset to 1
      newStreak = 1;
    }

    // --- 3. The "High Stakes" Payout ---
    // Only award points if it's a new day (daysDiff > 0) AND the streak hits a multiple of 5.
    if (daysDiff > 0) {
      if (newStreak % TUNING_STREAK_REQ_DAYS === 0) {
        earnedReferralPoints = TUNING_STREAK_REWARD; // The Jackpot
        milestoneReached = true;
      } else {
        earnedReferralPoints = 0; // The Grind (Days 1-4)
      }
    }

    // --- 4. Atomic Commit ---
    // Build dynamic transaction: Always update user and create session.
    // Conditionally update sponsor if tax applies.
    const transactionOps = [
      prisma.tuningSession.create({
        data: {
          userId,
          nodeId,
          score: accuracyScore,
          sharesEarned: parseFloat(sharesReward.toFixed(4)),
          milestoneReached,
          timestamp: now,
        },
      }),
      // Player receives net shares (after landlord tax)
      prisma.user.update({
        where: { id: userId },
        data: {
          // award the net shares to the player
          sharePoints: { increment: netShares },
          noOfReferrals: { increment: earnedReferralPoints },
          dailyStreak: newStreak,
          lastTunedAt: now,
        },
      }),
    ];

    // If tax applies, award sponsor the 3% cut (efficiently only if sponsorPiId exists)
    if (taxApplies && !!validation.sponsorPiId) {
      transactionOps.push(
        prisma.user.update({
          where: { piId: validation.sponsorPiId },
          data: {
            // award the landlord tax to the sponsor
            sharePoints: { increment: landlordTax },
          },
        })
      );
    }

    await prisma.$transaction(transactionOps);

    revalidatePath(`/nodes/${nodeId}`);

    return {
      success: true,
      data: {
        // shares is the net amount the player receives
        shares: netShares,
        // grossShares: the raw amount earned before tax (useful for UI)
        grossShares: grossShares,
        landlordTax,
        referralPoints: earnedReferralPoints,
        currentStreak: newStreak,
        milestoneReached,
      },
    };
  } catch (error) {
    console.error("Error completing tuning session:", error);
    return {
      success: false,
      error: "Failed to complete tuning session",
    };
  }
}
