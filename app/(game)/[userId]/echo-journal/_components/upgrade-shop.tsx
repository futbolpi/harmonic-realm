"use client";

import type React from "react";

import { useState } from "react";
import {
  Zap,
  TrendingUp,
  Target,
  Clock,
  ShoppingCart,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/lib/schema/user";

interface UpgradeShopProps {
  user: UserProfile;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "yield" | "mastery" | "efficiency" | "special";
  currentLevel: number;
  maxLevel: number;
  cost: number;
  benefit: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export function UpgradeShop({ user }: UpgradeShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const upgrades: Upgrade[] = [
    {
      id: "yield_boost",
      name: "Harmonic Amplifier",
      description: "Increases base yield from all node types",
      icon: Zap,
      category: "yield",
      currentLevel: 3,
      maxLevel: 10,
      cost: 150,
      benefit: "+15% yield per level",
      rarity: "rare",
    },
    {
      id: "mastery_accelerator",
      name: "Echo Resonator",
      description: "Gain mastery experience faster",
      icon: TrendingUp,
      category: "mastery",
      currentLevel: 1,
      maxLevel: 5,
      cost: 200,
      benefit: "+25% mastery XP",
      rarity: "epic",
    },
    {
      id: "efficiency_core",
      name: "Lattice Synchronizer",
      description: "Reduces mining session duration",
      icon: Clock,
      category: "efficiency",
      currentLevel: 0,
      maxLevel: 8,
      cost: 100,
      benefit: "-5% duration per level",
      rarity: "common",
    },
    {
      id: "precision_matrix",
      name: "Quantum Stabilizer",
      description: "Increases GPS accuracy and range",
      icon: Target,
      category: "special",
      currentLevel: 2,
      maxLevel: 6,
      cost: 300,
      benefit: "+10m range per level",
      rarity: "legendary",
    },
  ];

  const categories = [
    { id: "all", name: "All", icon: ShoppingCart },
    { id: "yield", name: "Yield", icon: Zap },
    { id: "mastery", name: "Mastery", icon: TrendingUp },
    { id: "efficiency", name: "Speed", icon: Clock },
    { id: "special", name: "Special", icon: Target },
  ];

  const filteredUpgrades =
    selectedCategory === "all"
      ? upgrades
      : upgrades.filter((upgrade) => upgrade.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400/30";
      case "rare":
        return "text-blue-400 border-blue-400/30";
      case "epic":
        return "text-purple-400 border-purple-400/30";
      case "legendary":
        return "text-yellow-400 border-yellow-400/30";
      default:
        return "text-gray-400 border-gray-400/30";
    }
  };

  const canAfford = (cost: number) => user.sharePoints >= cost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-game-accent" />
            Upgrade Shop
          </h2>
          <p className="text-muted-foreground">
            Enhance your mining capabilities
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <Coins className="h-4 w-4 text-game-accent" />
          <span className="font-medium">
            {user.sharePoints.toFixed(2)} Shares
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUpgrades.map((upgrade) => {
          const Icon = upgrade.icon;
          const progress = (upgrade.currentLevel / upgrade.maxLevel) * 100;
          const isMaxLevel = upgrade.currentLevel >= upgrade.maxLevel;
          const affordable = canAfford(upgrade.cost);

          return (
            <Card
              key={upgrade.id}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-game-accent/30 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-game-accent/20">
                      <Icon className="h-5 w-5 text-game-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                      <Badge className={getRarityColor(upgrade.rarity)}>
                        {upgrade.rarity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Level {upgrade.currentLevel}/{upgrade.maxLevel}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {upgrade.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {upgrade.currentLevel}/{upgrade.maxLevel}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium text-game-accent">
                      {upgrade.benefit}
                    </div>
                  </div>

                  {!isMaxLevel && (
                    <Button
                      size="sm"
                      disabled={!affordable}
                      className="flex items-center gap-2"
                    >
                      <Coins className="h-3 w-3" />
                      {upgrade.cost}
                    </Button>
                  )}

                  {isMaxLevel && <Badge variant="secondary">Max Level</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
