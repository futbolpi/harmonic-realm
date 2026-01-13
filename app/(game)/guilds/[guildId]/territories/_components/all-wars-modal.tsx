"use client";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/credenza";
import ChallengesTable from "./challenges-table";
import type { InitialChallenges } from "../services";

interface AllWarsModalProps {
  challenges: InitialChallenges;
}

export default function AllWarsModal({ challenges }: AllWarsModalProps) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="outline">View All Wars</Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Territory Wars</CredenzaTitle>
          <CredenzaDescription>
            Active and historical challenge records for your guild&apos;s
            territories
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="overflow-y-auto max-h-96">
          <ChallengesTable challenges={challenges} />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
