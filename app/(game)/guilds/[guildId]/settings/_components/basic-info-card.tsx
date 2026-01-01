"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  GuildSettingsParams,
  GuildSettingsSchema,
} from "@/lib/schema/guild/settings";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/shared/auth/auth-context";
import EmojiModal from "../../../create/_components/emoji-modal";
import { updateGuild } from "@/actions/guilds/update";

type Props = {
  guild: {
    name: string;
    description: string;
    tag: string;
    emblem: string;
    id: string;
  };
  isLeader: boolean;
  isOfficer: boolean;
};

const BasicInfoCard = ({ guild, isLeader, isOfficer }: Props) => {
  const [isSaving, startTransition] = useTransition();
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  const { accessToken } = useAuth();

  const form = useForm<GuildSettingsParams>({
    resolver: zodResolver(GuildSettingsSchema),
    defaultValues: {
      description: guild.description || "",
      guildId: guild.id,
      emblem: guild.emblem,
      accessToken: accessToken || "",
    },
  });

  const onSubmit = (vals: GuildSettingsParams) => {
    startTransition(async () => {
      try {
        const response = await updateGuild(vals);
        if (!response.success) {
          toast.error(response.error || "Update failed");
        } else {
          toast.success("Settings saved");
        }
      } catch (error) {
        console.log({ error });
        toast.error("Update failed");
      }
    });
  };

  const isAuthorized = isLeader || isOfficer;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">
                  Guild Name
                </label>
                <div className="mt-1 text-lg font-semibold">{guild.name}</div>
                <div className="text-xs text-muted-foreground">
                  Cannot be changed once created
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Guild Tag
                </label>
                <div className="mt-1 text-sm">[{guild.tag}]</div>
                <div className="text-xs text-muted-foreground">
                  Cannot be changed once created
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="We harmonize the Lattice..."
                        disabled={!isAuthorized}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Max 200 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4">
                <div className="text-4xl">{form.getValues().emblem}</div>
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowEmojiModal(true)}
                    disabled={!isAuthorized}
                  >
                    Change Emblem ({form.getValues().emblem || "N/A"})
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={!isAuthorized || isSaving}>
                Save Changes
              </Button>
            </div>
          </CardContent>

          <EmojiModal
            showEmojiModal={showEmojiModal}
            setShowEmojiModal={setShowEmojiModal}
            onSelect={(e) => {
              form.setValue("emblem", e, { shouldValidate: true });
              setShowEmojiModal(false);
            }}
          />
        </form>
      </Form>
    </Card>
  );
};

export default BasicInfoCard;
