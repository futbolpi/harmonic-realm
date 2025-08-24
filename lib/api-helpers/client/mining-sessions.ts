import {
  MiningSession,
  MiningSessionAssets,
  MiningSessionAssetsSchema,
  MiningSessionSchema,
} from "@/lib/schema/mining-session";

type FetchMiningSessionParams = {
  accessToken: string;
  nodeId: string;
  canMine: boolean;
};

type FetchMiningSessionAssetsParams = {
  accessToken: string;
  nodeId: string;
};

// Helper function to get user session with access token
export async function fetchMiningSession(
  params: FetchMiningSessionParams
): Promise<MiningSession> {
  const { accessToken, nodeId, canMine } = params;
  if (!canMine) {
    return null;
  }

  const response = await fetch(`/api/${nodeId}/mining-session`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mining session");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch mining session");
  }

  // Validate and parse the response data
  return MiningSessionSchema.parse(data.data);
}

// Helper function to get user session assets
export async function fetchMiningSessionAssets(
  params: FetchMiningSessionAssetsParams
): Promise<MiningSessionAssets> {
  const { accessToken, nodeId } = params;

  const response = await fetch(`/api/${nodeId}/mining-session/assets`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch mining session");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch mining session");
  }

  // Validate and parse the response data
  return MiningSessionAssetsSchema.parse(data.data);
}
