"use client";

import type { Control } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { CreateGuildParams } from "@/lib/schema/guild/create";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { GUILD_CREATION_FEE } from "@/config/guilds/constants";

type Props = { control: Control<CreateGuildParams> };

const ThirdStep = ({ control }: Props) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="requireApproval"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Membership</FormLabel>
            <FormDescription className="text-sm">
              Who can join your guild?
            </FormDescription>
            <div className="flex gap-3 mt-2">
              <label
                className={`p-2 rounded-md border ${
                  field.value ? "border-border" : "border-primary"
                }`}
              >
                <input
                  type="radio"
                  checked={!field.value}
                  onChange={() => field.onChange(false)}
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
        control={control}
        name="minRF"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum RF Required</FormLabel>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  defaultValue={[field.value ?? 0]}
                  max={20}
                  step={1}
                  onValueChange={(v) => field.onChange(v[0])}
                />
              </div>
              <div className="w-14 text-right">{field.value ?? 0}</div>
            </div>
            <FormDescription className="text-xs">
              RF 5+ (Casual players)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="autoKickInactive"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <div>
              <FormLabel>Auto-kick Inactive Members</FormLabel>
              <FormDescription className="text-xs">
                Kicks members inactive 14+ days
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="rounded-lg border p-3 bg-muted/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Creation Cost</p>
            <p className="font-semibold">🟡 {GUILD_CREATION_FEE}π</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdStep;
