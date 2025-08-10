import { type UserStats, UserStatsSchema } from "@/lib/schema/user";

// Helper function to get user profile with access token
export async function fetchUserProfile(
  accessToken: string
): Promise<UserStats> {
  const response = await fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch profile");
  }

  // Validate and parse the response data
  return UserStatsSchema.parse(data.data);
}
