"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  CreateGuildSchema,
  type CreateGuildParams,
} from "@/lib/schema/guild/create";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/shared/auth/auth-context";
import { createGuild } from "@/actions/guilds/create";
import { useProfile } from "@/hooks/queries/use-profile";
import { GUILD_CREATION_FEE } from "@/config/guilds/constants";
import FirstStep from "./first-step";
import SecondStep from "./second-step";
import ThirdStep from "./third-step";
import SuccessModal from "./success-modal";

type Props = {
  existingNames: string[];
};

export default function CreateClient({ existingNames }: Props) {
  const [isLoading, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const router = useRouter();

  const { accessToken } = useAuth();
  const { data: profile, refreshProfile } = useProfile();

  const showSuccess = profile?.guildMembership?.role === "LEADER";

  const availability = (value: string) => {
    if (!value) return null;
    const taken = existingNames.some(
      (n) => n.toLowerCase() === value.toLowerCase()
    );
    return taken ? "taken" : "available";
  };

  const form = useForm<CreateGuildParams>({
    resolver: zodResolver(CreateGuildSchema),
    defaultValues: {
      name: "",
      tag: "",
      description: "",
      emblem: "",
      requireApproval: true,
      minRF: 0,
      autoKickInactive: false,
      accessToken: accessToken ?? "",
    },
  });

  const next = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    // validate current step fields before going next
    const ok = await form.trigger(
      step === 1 ? ["name", "tag", "description"] : step === 2 ? ["emblem"] : []
    );
    if (!ok) return;

    if (step === 1 && availability(form.getValues().name) === "taken") {
      return;
    }

    setStep((s) => Math.min(3, s + 1));
  };

  const back = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = (vals: CreateGuildParams) => {
    startTransition(async () => {
      try {
        // Simulate creation and success
        const response = await createGuild(vals);
        if (!response.success) {
          toast.error(response.error || "Create failed");
        } else {
          refreshProfile();
          confetti({ particleCount: 80, spread: 60 });
          toast.success(
            "Guild created! Complete Pi payment to activate guild."
          );
          // route to new guild
          router.push(`/guilds/${response.data?.id}/settings?tab=payments`);
        }
      } catch (err) {
        console.log({ err });
        toast.error("Create failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Your Guild</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <FirstStep
                  control={form.control}
                  existingNames={existingNames}
                />
              )}

              {step === 2 && (
                <SecondStep
                  control={form.control}
                  name={form.getValues().name || "Guild Name"}
                  tag={form.getValues().tag || "TAG"}
                />
              )}

              {step === 3 && <ThirdStep control={form.control} />}

              <div className="flex justify-between mt-2">
                <Button
                  variant="ghost"
                  onClick={back}
                  type="button"
                  disabled={step === 1}
                >
                  Back
                </Button>
                {step < 3 ? (
                  <Button onClick={next} type="button">
                    Next: {step === 1 ? "Emblem →" : "Settings →"}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="game-button"
                    disabled={isLoading}
                  >
                    Create Guild for {GUILD_CREATION_FEE}π
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SuccessModal
        guildId={profile?.guildMembership?.guildId ?? ""}
        showSuccess={showSuccess}
      />
    </div>
  );
}
