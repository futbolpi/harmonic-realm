"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/shared/auth/auth-context";
import { LoreStakeDetails } from "@/lib/schema/location-lore";

async function fetchLoreStake(
  stakeId: string,
  accessToken: string
): Promise<LoreStakeDetails> {
  const response = await fetch(`/api/lore-stakes/${stakeId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch stake details");
  }

  const data = await response.json();
  return data.data;
}

export function useLoreStake(stakeId: string) {
  const { isAuthenticated, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["loreStake", stakeId, accessToken],
    queryFn: async () => {
      if (!isAuthenticated || !accessToken) {
        throw new Error("User not authenticated");
      }

      return fetchLoreStake(stakeId, accessToken);
    },
    enabled: isAuthenticated && !!accessToken && !!stakeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message?.includes("401") ||
        error.message?.includes("unauthorized") ||
        error.message?.includes("not found")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const refreshStake = () => {
    queryClient.invalidateQueries({
      queryKey: ["loreStake", stakeId, accessToken],
    });
  };

  return {
    ...query,
    refreshStake,
  };
}
