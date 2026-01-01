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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateGuildParams } from "@/lib/schema/guild/create";

type Props = { control: Control<CreateGuildParams>; existingNames: string[] };

const FirstStep = ({ control, existingNames }: Props) => {
  const availability = (value: string) => {
    if (!value) return null;
    const taken = existingNames.some(
      (n) => n.toLowerCase() === value.toLowerCase()
    );
    return taken ? "taken" : "available";
  };

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guild Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Resonance Masters" />
            </FormControl>
            <FormDescription className="text-xs">
              3-24 characters, unique
            </FormDescription>
            <FormMessage />
            <div className="mt-1 text-xs text-muted-foreground">
              {availability(field.value) === "available" && (
                <span className="text-green-600">✓ Available</span>
              )}
              {availability(field.value) === "taken" && (
                <span className="text-red-600">✕ Name taken</span>
              )}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Guild Tag</FormLabel>
            <FormControl>
              <Input {...field} placeholder="RES" />
            </FormControl>
            <FormDescription className="text-xs">
              3-4 characters, shown on map
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="We harmonize the Lattice together..."
              />
            </FormControl>
            <FormDescription className="text-xs">
              Max 200 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FirstStep;
