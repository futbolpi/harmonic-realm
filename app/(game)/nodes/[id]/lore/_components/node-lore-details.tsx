import { MapPin, Sparkles, Users, Coins, BookOpen, Zap } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LORE_LEVELS } from "@/lib/node-lore/location-lore";
import { cn } from "@/lib/utils";
import { Response } from "@/components/ai-elements/response";
import { getNodeLore } from "../services";
import { LoreStakingDialog } from "./lore-staking-dialog";
import { LoreStakesTable } from "./lore-stakes-table";

interface NodeLoreDetailsProps {
  nodeId: string;
}

export async function NodeLoreDetails({ nodeId }: NodeLoreDetailsProps) {
  const node = await getNodeLore(nodeId);

  if (!node) {
    notFound();
  }

  const currentLevel = node.locationLore?.currentLevel || 0;
  const totalStaked = node.locationLore?.totalPiStaked.toNumber() || 0;
  const nextLevel = currentLevel + 1;

  const getRarityGlow = (rarity: string) => {
    const rarityMap = {
      Common: "mastery-glow-common",
      Uncommon: "mastery-glow-uncommon",
      Rare: "mastery-glow-rare",
      Epic: "mastery-glow-epic",
      Legendary: "mastery-glow-legendary",
    };
    return rarityMap[rarity as keyof typeof rarityMap] || "";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" />
          <span>
            {node?.locationLore?.city || "N/A"},{" "}
            {node?.locationLore?.state || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold text-balance neon-text">
            {node.name}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-medium",
              getRarityGlow(node.type.rarity)
            )}
          >
            {node.type.rarity} {node.type.name}
          </Badge>
        </div>

        <p className="text-muted-foreground text-pretty">
          {node.type.description}
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="lore" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="lore" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Lore</span>
          </TabsTrigger>
          <TabsTrigger value="stakes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Community Stakes</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Node Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lore" className="space-y-6">
          {/* Lore Progress Section */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Lore Awakening Progress
              </CardTitle>
              <CardDescription className="underline text-primary">
                <Link href={`/lore/${nodeId}`}>Alternate Lore.</Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.values(LORE_LEVELS).map((level, i) => {
                const isUnlocked = currentLevel >= i + 1;
                const isNext = i + 1 === nextLevel;
                const progress = isUnlocked
                  ? 100
                  : isNext
                  ? (totalStaked / (level.totalRequired || level.piRequired)) *
                    100
                  : 0;

                return (
                  <div key={i + 1} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                            isUnlocked
                              ? "bg-primary text-primary-foreground"
                              : isNext
                              ? "bg-accent text-accent-foreground harmonic-pulse"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {level.totalRequired || level.piRequired} Pi total
                            required
                          </p>
                        </div>
                      </div>

                      {isNext && (
                        <LoreStakingDialog
                          nodeId={nodeId}
                          targetLevel={i + 1}
                          currentStaked={totalStaked}
                        />
                      )}
                    </div>

                    <Progress
                      value={progress}
                      className={cn(
                        "h-2",
                        isUnlocked && "bg-primary/20",
                        isNext && "bg-accent/20"
                      )}
                    />

                    {isUnlocked && i + 1 <= 2 && (
                      <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                        <Response className="text-sm leading-relaxed">
                          {i + 1 === 1
                            ? node.locationLore?.basicHistory
                            : i + 1 === 2
                            ? node.locationLore?.culturalSignificance
                            : i + 1 === 3
                            ? node.locationLore?.mysticInterpretation
                            : i + 1 === 4
                            ? node.locationLore?.epicNarrative
                            : i + 1 === 5
                            ? node.locationLore?.legendaryTale
                            : ""}
                        </Response>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Call to Action for No Lore */}
          {currentLevel === 0 && (
            <Card className="border-dashed border-2 border-primary/50 bg-primary/5">
              <CardContent className="text-center py-8">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 harmonic-pulse" />
                <h3 className="text-xl font-bold mb-2">
                  Awaken This Location&apos;s Story
                </h3>
                <p className="text-muted-foreground mb-6 text-pretty">
                  This node holds untold mysteries waiting to be discovered. Be
                  the first Pioneer to unlock its secrets through collaborative
                  storytelling.
                </p>
                <LoreStakingDialog
                  nodeId={nodeId}
                  targetLevel={1}
                  currentStaked={totalStaked}
                  trigger={
                    <Button className="game-button" size="lg">
                      <Coins className="h-5 w-5 mr-2" />
                      Begin the Awakening (0.5 Pi)
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stakes">
          <LoreStakesTable nodeId={nodeId} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Node Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{node.type.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rarity:</span>
                  <p className="font-medium">{node.type.rarity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Coordinates:</span>
                  <p className="font-mono text-xs">
                    {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Staked:</span>
                  <p className="font-medium">{totalStaked} Pi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
