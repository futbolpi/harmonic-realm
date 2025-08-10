"use client";

import { ReactNode, useEffect } from "react";
import { useQueryStates } from "nuqs";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/shared/auth/auth-context";
import AuthLoading from "@/components/shared/auth/auth-loading";
import {
  authSearchParamsParsers,
  authSearchParamsUrlKeys,
} from "@/components/shared/auth/search-params";

const AuthRouteGuard = ({ children }: { children: ReactNode }) => {
  const [{ redirect }] = useQueryStates(authSearchParamsParsers, {
    urlKeys: authSearchParamsUrlKeys,
  });

  const router = useRouter();

  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard or redirect page if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirect);
    }
  }, [redirect, isAuthenticated, isLoading, router]);

  // Show loading state or nothing while checking auth
  if (isLoading || isAuthenticated) {
    return <AuthLoading />;
  }

  return <>{children}</>;
};

export default AuthRouteGuard;
