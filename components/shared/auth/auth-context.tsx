"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getPiSDK } from "@/components/shared/pi/pi-sdk";
import { UserSession, userSessionSchema } from "@/lib/schema/auth";
import { onIncompletePaymentFound } from "@/lib/pi/payment-callbacks";
import { signIn, verifyToken } from "./utils";

// Auth types
interface AuthState {
  user: UserSession;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<AuthState>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const ACCESS_TOKEN_KEY = "pi_mining_nodes_access_token";
const USER_DATA_KEY = "pi_mining_nodes_user";

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth query
  const { data: authState, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: async (): Promise<AuthState> => {
      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_DATA_KEY);

      if (!storedToken || !storedUser) {
        return {
          user: null,
          accessToken: null,
          isLoading: false,
          isAuthenticated: false,
        };
      }

      try {
        const user = JSON.parse(storedUser) as unknown;
        const { success, data: parsedUser } = userSessionSchema.safeParse(user);

        const { isValid } = await verifyToken(storedToken);

        if (!isValid || !success || !parsedUser) {
          // Clear invalid data
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(USER_DATA_KEY);
          return {
            user: null,
            accessToken: null,
            isLoading: false,
            isAuthenticated: false,
          };
        }

        return {
          user: parsedUser,
          accessToken: storedToken,
          isLoading: false,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("Auth state error:", error);
        // Clear invalid data
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        return {
          user: null,
          accessToken: null,
          isLoading: false,
          isAuthenticated: false,
        };
      }
    },
    // Refetch every 15 minutes to verify token
    refetchInterval: 15 * 60 * 1000,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const piSDK = getPiSDK();
      const { accessToken, user } = await piSDK.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      );

      // Verify token with backend, upsert user accesstoken,
      // username and piuserid, use new function

      const params = new URLSearchParams(document.location.search);
      const referral = params.get("ref");

      const session = await signIn({
        accessToken,
        user,
        referral,
      });

      if (!session) {
        throw new Error("Authentication failed");
      }

      return {
        accessToken,
        user: session,
        isLoading,
        isAuthenticated: true,
      };
    },
    onSuccess: ({ accessToken, user }) => {
      // Invalidate auth query to refetch
      // Store in localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("You are successfully logged in");
      // router.push(afterLoginUrl);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    queryClient.invalidateQueries({ queryKey: ["auth"] });
    router.push("/");
  };

  const contextValue: AuthContextType = {
    user: authState?.user || null,
    accessToken: authState?.accessToken || null,
    isLoading,
    isAuthenticated: authState?.isAuthenticated || false,
    login: loginMutation.mutateAsync,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
