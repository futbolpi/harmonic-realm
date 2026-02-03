import { getUserActiveChambers } from "@/lib/api-helpers/server/chamber-helpers";

/**
 * Get user's active chambers with real-time durability
 * Validates token and ownership
 */
export async function getUserChambersForPage(userId: string) {
  try {
    const chambers = await getUserActiveChambers(userId);

    return {
      success: true,
      data: chambers,
    };
  } catch (error) {
    console.error("Error fetching user chambers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch chambers",
      data: [],
    };
  }
}
