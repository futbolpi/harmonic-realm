import { type NodesResponse, NodesResponseSchema } from "@/lib/schema/node";

// Helper function to get nodes near user location
export async function fetchNearbyNodes(
  accessToken: string,
  latitude?: number,
  longitude?: number
): Promise<NodesResponse> {
  const params = new URLSearchParams();
  if (latitude !== undefined) params.append("lat", latitude.toString());
  if (longitude !== undefined) params.append("lng", longitude.toString());

  const response = await fetch(`/api/nodes?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch nodes: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch nodes");
  }

  return NodesResponseSchema.parse(data.data);
}
