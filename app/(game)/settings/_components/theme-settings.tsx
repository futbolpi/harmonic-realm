"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Palette } from "lucide-react";

import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light",
      label: "Solar Resonance",
      icon: Sun,
      description: "Bright cosmic energy",
    },
    {
      value: "dark",
      label: "Void Harmony",
      icon: Moon,
      description: "Deep space tranquility",
    },
    {
      value: "system",
      label: "Lattice Sync",
      icon: Monitor,
      description: "Adaptive to your device",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Resonance Theme
        </CardTitle>
        <CardDescription className="">
          Choose your visual harmony with the cosmic Lattice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={theme === option.value ? "default" : "outline"}
                className={`justify-start h-auto p-4 ${
                  theme === option.value
                    ? "bg-gradient-to-r from-primary/90 to-secondary border-primary"
                    : "border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                }`}
                onClick={() => setTheme(option.value)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm opacity-70">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
