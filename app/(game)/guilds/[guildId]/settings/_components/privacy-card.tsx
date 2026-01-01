"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  GuildSettingsParams,
  GuildSettingsSchema,
} from "@/lib/schema/guild/settings";
import { useAuth } from "@/components/shared/auth/auth-context";
import { Button } from "@/components/ui/button";
import { updateGuild } from "@/actions/guilds/update";

type Props = {
  guild: {
    requireApproval: boolean;
    isPublic: boolean;
    minRF: number;
    id: string;
  };
  isAuthorized: boolean;
};

const PrivacyCard = ({ guild, isAuthorized }: Props) => {
  const [isSaving, startTransition] = useTransition();

  const { accessToken } = useAuth();

  const form = useForm<GuildSettingsParams>({
    resolver: zodResolver(GuildSettingsSchema),
    defaultValues: {
      accessToken: accessToken || "",
      guildId: guild.id,
      isPublic: guild.isPublic,
      requireApproval: guild.requireApproval,
      minRF: guild.minRF,
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Access</CardTitle>
        </CardHeader>
        <Form {...form}>
          <CardContent className="space-y-2">
            <FormField
              control={form.control}
              name="requireApproval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Type</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <label
                      className={`p-2 rounded-md border ${
                        !field.value ? "border-primary" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={!field.value}
                        onChange={() => field.onChange(false)}
                        disabled={!isAuthorized}
                      />{" "}
                      <span className="ml-2">Public</span>
                    </label>
                    <label
                      className={`p-2 rounded-md border ${
                        field.value ? "border-primary" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={field.value}
                        onChange={() => field.onChange(true)}
                      />{" "}
                      <span className="ml-2">Approval Required</span>
                    </label>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minRF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Resonance Fidelity</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        defaultValue={[field.value ?? 0]}
                        max={100}
                        step={1}
                        disabled={!isAuthorized}
                        onValueChange={(v) => field.onChange(v[0])}
                      />
                    </div>
                    <div className="w-12 text-right">{field.value ?? 0}</div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Show in Guild Discovery</FormLabel>
                    <FormDescription className="text-xs">
                      Visible to all players
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                      disabled={!isAuthorized}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={!isAuthorized || isSaving}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Form>
      </Card>
    </form>
  );
};

export default PrivacyCard;
