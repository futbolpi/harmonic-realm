"use client";

import { LogIn } from "lucide-react";
import { type ReactNode, type ComponentProps, useTransition } from "react";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "./auth-context";
import { LoadingAnimation } from "../loading-animation";

type LoginParams = {redirect:string; }

type LoginModalProps = ComponentProps<"button"> & 
  VariantProps<typeof buttonVariants> & LoginParams & { buttonText?: ReactNode };

const LoginModal = ({
  className,
  redirect,
  buttonText,
  ...props
}: LoginModalProps) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter()

  const { login, isAuthenticated } = useAuth();

  const renderedText =
    props.size === "icon" ? <LogIn /> : buttonText ?? "Get Started";

  const handleLogin = async () => {
        startTransition(async()=>{
          try {
            await login();
            router.push(redirect)
          } catch (error) {
            console.error("Login error:", error);
          }
        })
      };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button className={cn("rounded-full", className)} {...props}>
          {renderedText}
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Login</CredenzaTitle>
          <CredenzaDescription>
            Attune to the Lattice
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
         Sign in to begin your journey as a Pioneer, discovering Nodes seeded from Pi&apos;s infinite digits across the world.
        </CredenzaBody>
        <CredenzaFooter>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <LoadingAnimation /> : "Sign In"}
          </Button>
          <CredenzaClose asChild>
            <Button variant={"destructive"}>Close</Button>
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default LoginModal;
