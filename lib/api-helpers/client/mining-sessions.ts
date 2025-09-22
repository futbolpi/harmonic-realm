import {
  MiningSessionAssets,
  MiningSessionAssetsSchema,
} from "@/lib/schema/mining-session";

type FetchMiningSessionAssetsParams = {
  accessToken: string;
  nodeId: string;
};

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
