"use client";

import { Filter } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaTitle,
  CredenzaHeader,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { MapControls } from "./map-controls";

type MapControlModalProps = { nodes: Node[] };

export function MapControlModal({ nodes }: MapControlModalProps) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button className="shadow-lg">
          <Filter className="h-4 w-4 mr-2" />
          Filters & Sort
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Map Controls</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="p-4 md:p-0 md:mt-6">
            <MapControls nodes={nodes} />
          </div>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}
