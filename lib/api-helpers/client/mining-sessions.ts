import {
  type MiningSessionResponse,
  MiningSessionResponseSchema,
} from "@/lib/schema/mining-session";

type FetchMiningSessionParams = {
  accessToken: string;
  nodeId: string;
  latitude: number;
  longitude: number;
};

// Helper function to get user session with access token
export async function fetchMiningSession(
  params: FetchMiningSessionParams
): Promise<MiningSessionResponse> {
  const { accessToken, latitude, longitude, nodeId } = params;

  const searchParams = new URLSearchParams({
    nodeId,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });

  const response = await fetch(`/api/mining-session?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mining session");
  }

  const data = await response.json();

  // Validate and parse the response data
  return MiningSessionResponseSchema.parse(data);
}
