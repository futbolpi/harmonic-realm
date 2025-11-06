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
import HelperSnippet from "./helper-snippet.mdx";

export function AnchorHelpModal() {
  return (
    <>
      <Credenza>
        <CredenzaTrigger asChild>
          <Button
            size="sm"
            variant={"ghost"}
            className="cursor-pointer shadow-lg"
          >
            <CircleQuestionMark className="h-4 w-4" />
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Your Cosmic Anchor</CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="p-4 max-h-96 prose prose-invert prose-lg overflow-y-auto">
              <HelperSnippet />
            </div>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </>
  );
}
