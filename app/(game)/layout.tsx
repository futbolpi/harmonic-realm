"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createSerializer } from "nuqs";

import { useAuth } from "@/components/shared/auth/auth-context";
import { authSearchParamsParsers } from "@/components/shared/auth/search-params";
import { GameNavigation } from "./_components/navigation";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if accessing protected routes without auth
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const serialize = createSerializer(authSearchParamsParsers);
      const redirect = serialize("/login", { redirect: pathname }); // /login?redirect=pathname
      router.push(redirect);
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-game-dark via-game-accent to-game-highlight">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-accent to-game-highlight">
      <GameNavigation />
      <main className="pb-20">{children}</main>
    </div>
  );
}
