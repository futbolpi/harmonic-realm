"use client";

// import { useState } from "react";
import { Palette } from "lucide-react";
import Link from "next/link";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
import ThemeSettings from "./theme-settings";

export function SettingsClient() {
  //   const [soundEnabled, setSoundEnabled] = useState(true);
  //   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  //   const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background/80 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-blue-500/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-400/40 to-secondary/40 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-300/50 to-blue-300/50" />
            <Palette className="absolute inset-6 w-8 h-8 text-purple-200" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Harmonic Calibration
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Fine-tune your resonance frequency and customize your Pioneer
            interface within the cosmic Lattice.
          </p>
        </div>

        {/* add grid cols 2 */}

        <div className="grid gap-6">
          {/* Theme Settings */}
          <ThemeSettings />

          {/* Interface Settings */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Interface Harmonics</CardTitle>
              <CardDescription>
                Customize your Pioneer experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-secondary" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <Label className="text-slate-200">Cosmic Audio</Label>
                    <p className="text-sm text-slate-400">
                      Lattice resonance sounds
                    </p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <Separator className="bg-primary/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {notificationsEnabled ? (
                    <Bell className="w-5 h-5 text-secondary" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <Label className="text-slate-200">Echo Alerts</Label>
                    <p className="text-sm text-slate-400">
                      Mining and discovery notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <Separator className="bg-primary/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full ${
                      animationsEnabled
                        ? "bg-gradient-to-r from-purple-400 to-secondary animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  <div>
                    <Label className="text-slate-200">
                      Harmonic Animations
                    </Label>
                    <p className="text-sm text-slate-400">
                      Visual effects and transitions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Pioneer Profile */}
          {/* <Card className="bg-slate-800/50 border-primary/20 backdrop-blur-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-300">
                Pioneer Resonance Profile
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your unique harmonic signature within the Lattice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-slate-200">Resonance Frequency</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger className="bg-slate-700/50 border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        High Energy (Fast animations)
                      </SelectItem>
                      <SelectItem value="balanced">
                        Balanced Harmony (Default)
                      </SelectItem>
                      <SelectItem value="low">
                        Deep Resonance (Slow animations)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-200">Echo Sensitivity</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="bg-slate-700/50 border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        Hypersensitive (All notifications)
                      </SelectItem>
                      <SelectItem value="normal">
                        Standard (Important only)
                      </SelectItem>
                      <SelectItem value="low">
                        Minimal (Critical only)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Navigation */}
        <div className="flex justify-center pt-8">
          <Button asChild className="game-button">
            <Link href="/dashboard">Return to Resonance Hub</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
