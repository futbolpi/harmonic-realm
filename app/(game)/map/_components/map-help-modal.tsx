"use client";

import { CircleQuestionMark } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaTitle,
  CredenzaHeader,
  CredenzaTrigger,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import MapHelpContent from "./map-help-content.mdx";

export function MapHelpModal() {
  return (
    <>
      <Credenza>
        <CredenzaTrigger asChild>
          <Button size="sm" className="game-button cursor-pointer shadow-lg">
            <CircleQuestionMark className="h-4 w-4" />
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>How to Mine Nodes</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="p-4 max-h-96 prose prose-invert prose-lg overflow-y-auto">
              <MapHelpContent />
            </div>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </>
  );
}
