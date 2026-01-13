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
import TerritoriesTable from "./territories-table";
import type { InitialTerritories } from "../services";

interface AllTerritoriesModalProps {
  territories: InitialTerritories;
}

export default function AllTerritoriesModal({
  territories,
}: AllTerritoriesModalProps) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="outline">View All Territories</Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>All Territories</CredenzaTitle>
          <CredenzaDescription>
            {territories.length} territory control
            {territories.length !== 1 ? "s" : ""} managed by your guild
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="overflow-y-auto max-h-96">
          <TerritoriesTable territories={territories} />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
