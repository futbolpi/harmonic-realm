"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/shared/auth/auth-context";
import { fetchUserProfile } from "@/lib/api-helpers/client/users";
import { UserStats } from "@/lib/schema/user";

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", user?.piId],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }
      // In a real app, you'd get the actual access token from your auth system
      const accessToken = `Bearer mock-token-${user.piId}`;
      return fetchUserProfile(accessToken);
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
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

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["profile", user?.piId] });
  };

  const updateProfileCache = (updater: (old: UserStats) => UserStats) => {
    queryClient.setQueryData(["profile", user?.piId], updater);
  };

  return {
    ...query,
    refreshProfile,
    updateProfileCache,
    userStats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
