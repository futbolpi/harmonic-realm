"use client";

import type { Dispatch, SetStateAction } from "react";
import dynamic from "next/dynamic";
import { Theme, EmojiStyle } from "emoji-picker-react";
import { useTheme } from "next-themes";

import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

type Props = {
  setShowEmojiModal: Dispatch<SetStateAction<boolean>>;
  showEmojiModal: boolean;
  onSelect: (e: string) => void;
};

const EmojiModal = ({ setShowEmojiModal, showEmojiModal, onSelect }: Props) => {
  const { resolvedTheme } = useTheme();

  return (
    <Credenza open={showEmojiModal} onOpenChange={setShowEmojiModal}>
      <CredenzaContent className="max-w-md p-4">
        <CredenzaHeader>
          <CredenzaTitle>Pick Emoji!</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          <Picker
            theme={resolvedTheme === "light" ? Theme.LIGHT : Theme.DARK}
            onEmojiClick={(e) => onSelect(e.emoji)}
            emojiStyle={EmojiStyle.GOOGLE}
          />
        </CredenzaBody>
        <CredenzaFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowEmojiModal(false);
            }}
          >
            Close
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default EmojiModal;
