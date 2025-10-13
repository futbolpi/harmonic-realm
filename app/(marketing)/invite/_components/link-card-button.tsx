"use client";

import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth/auth-context";
import { LoadingAnimation } from "@/components/shared/loading-animation";
import LoginModal from "@/components/shared/auth/login-modal";

type LinkCardButtonProps = {
  isExternal: boolean;
  redirect: string;
};

const LinkCardButton = ({
  isExternal,
  redirect,
}: LinkCardButtonProps) => {
  const { isLoading,isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <Button disabled>
        <LoadingAnimation />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal redirect={redirect} />;
  }

  return (
    <Button onClick={() => router.push(redirect)}>
      {isExternal ? (
        <ArrowUpRight className="h-4 w-4 animate-pulse" />
      ) : (
        <ArrowRight className="h-4 w-4 animate-pulse" />
      )}{" "}
      Get Started
    </Button>
  );
};

export default LinkCardButton;
