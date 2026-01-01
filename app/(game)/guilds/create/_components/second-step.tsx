"use client";

import { useState } from "react";
import { Control } from "react-hook-form";

import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateGuildParams } from "@/lib/schema/guild/create";
import EmojiModal from "./emoji-modal";

type Props = {
  name: string;
  tag: string;
  control: Control<CreateGuildParams>;
};

const SecondStep = ({ name, tag, control }: Props) => {
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="emblem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Choose Guild Emblem</FormLabel>
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmojiModal(true)}
              >
                Select Emblem ({field.value || "N/A"})
              </Button>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Preview</h4>
              <div className="mt-2 p-3 border rounded-md flex items-center gap-3">
                <div className="text-3xl">{field.value}</div>
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs text-muted-foreground">[{tag}]</div>
                </div>
              </div>
            </div>
            <EmojiModal
              setShowEmojiModal={setShowEmojiModal}
              showEmojiModal={showEmojiModal}
              onSelect={(e) => {
                setShowEmojiModal(false);
                field.onChange(e);
              }}
            />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SecondStep;
