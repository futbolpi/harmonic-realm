"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/shared/auth/auth-context";
import { fetchMiningSessionAssets } from "@/lib/api-helpers/client/mining-sessions";

export function useMiningSessionAssets(nodeId: string) {
  const { isAuthenticated, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["session-assets", nodeId],
    queryFn: async () => {
      if (!isAuthenticated || !accessToken) {
        throw new Error("User not authenticated");
      }

      return fetchMiningSessionAssets({ accessToken, nodeId });
    },
    enabled: isAuthenticated && !!accessToken && !!nodeId,
    staleTime: 60 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const refreshSessionAssets = () => {
    queryClient.invalidateQueries({
      queryKey: ["session-assets", nodeId],
    });
  };

  return {
    ...query,
    refreshSessionAssets,
  };
}
