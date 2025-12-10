"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useProfile } from "@/hooks/queries/use-profile";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";

const StartTutorialModal = () => {
  const [openModal, setOpenModal] = useState(true);
  const router = useRouter();

  const { data: profile } = useProfile();

  if (!profile || profile.hasCompletedTutorial === true) {
    return null;
  }

  return (
    <Credenza
      open={openModal && profile.hasCompletedTutorial === false}
      onOpenChange={(open) => {
        setOpenModal(open);
      }}
    >
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Start With The Ephemeral Spark</CredenzaTitle>
          <CredenzaDescription>
            New here? Try the Ephemeral Spark tutorial to learn mining and
            tuning before exploring real nodes.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <p className="text-sm text-muted-foreground">
            Complete the short tutorial to earn a small reward and unlock full
            map interaction.
          </p>
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2 justify-end">
          <CredenzaClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setOpenModal(false);
              }}
            >
              Dismiss
            </Button>
          </CredenzaClose>
          <Button
            onClick={() => {
              setOpenModal(false);
              router.push("/tutorial");
            }}
          >
            Begin Tutorial
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default StartTutorialModal;
