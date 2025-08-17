"use client";

import { useState } from "react";
import { BookOpen, Search, Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LoreFragment {
  id: string;
  title: string;
  content: string;
  category: "echo" | "lattice" | "guardian" | "harmonic" | "ancient";
  rarity: "common" | "rare" | "epic" | "legendary";
  discoveredAt: Date;
  nodeId: string;
  isUnlocked: boolean;
}

interface LoreFragmentsGalleryProps {
  userId: string;
}

export function LoreFragmentsGallery({ userId }: LoreFragmentsGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock lore fragments data
  const loreFragments: LoreFragment[] = [
    {
      id: "fragment_1",
      title: "The First Echo",
      content:
        "In the beginning, there was silence. Then came the first Echo, a resonance that would birth the Lattice and awaken the Guardians. This fragment speaks of the cosmic frequency that underlies all existence, the mathematical constant that we now know as Pi...",
      category: "echo",
      rarity: "legendary",
      discoveredAt: new Date("2024-01-15"),
      nodeId: "node_1",
      isUnlocked: true,
    },
    {
      id: "fragment_2",
      title: "Guardian's Whisper",
      content:
        "The Echo Guardians were not created, but awakened. They emerged from the intersection of infinite digits, each one a keeper of cosmic secrets. Their whispers guide the Pioneers through the Lattice...",
      category: "guardian",
      rarity: "epic",
      discoveredAt: new Date("2024-01-16"),
      nodeId: "node_2",
      isUnlocked: true,
    },
    {
      id: "fragment_3",
      title: "Lattice Convergence",
      content:
        "Where the lines of the Lattice converge, reality bends. These points of intersection are where the Nodes manifest, anchored to the physical realm yet connected to the infinite...",
      category: "lattice",
      rarity: "rare",
      discoveredAt: new Date("2024-01-17"),
      nodeId: "node_3",
      isUnlocked: true,
    },
    {
      id: "fragment_4",
      title: "The Sealed Prophecy",
      content: "???",
      category: "ancient",
      rarity: "legendary",
      discoveredAt: new Date("2024-01-20"),
      nodeId: "node_4",
      isUnlocked: false,
    },
  ];

  const categories = [
    { id: "all", name: "All", color: "text-gray-400" },
    { id: "echo", name: "Echo", color: "text-blue-400" },
    { id: "lattice", name: "Lattice", color: "text-green-400" },
    { id: "guardian", name: "Guardian", color: "text-purple-400" },
    { id: "harmonic", name: "Harmonic", color: "text-yellow-400" },
    { id: "ancient", name: "Ancient", color: "text-red-400" },
  ];

  const filteredFragments = loreFragments.filter((fragment) => {
    const matchesSearch = fragment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || fragment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
      case "rare":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      case "epic":
        return "text-purple-400 border-purple-400/30 bg-purple-400/10";
      case "legendary":
        return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      default:
        return "text-gray-400 border-gray-400/30 bg-gray-400/10";
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.color || "text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-game-accent" />
            Lore Fragments
          </h2>
          <p className="text-muted-foreground">
            Discovered: {loreFragments.filter((f) => f.isUnlocked).length} /{" "}
            {loreFragments.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fragments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <div
                className={`w-2 h-2 rounded-full ${category.color.replace(
                  "text-",
                  "bg-"
                )}`}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Fragments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFragments.map((fragment) => (
          <Card
            key={fragment.id}
            className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-game-accent/30 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {fragment.isUnlocked ? (
                        <Sparkles className="h-4 w-4 text-game-accent" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {fragment.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRarityColor(fragment.rarity)}>
                        {fragment.rarity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getCategoryColor(fragment.category)}
                      >
                        {fragment.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="text-sm text-muted-foreground">
                  {fragment.isUnlocked ? (
                    <p className="line-clamp-3">{fragment.content}</p>
                  ) : (
                    <p className="italic">
                      This fragment remains sealed. Continue your journey to
                      unlock its secrets...
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {fragment.isUnlocked
                      ? `Discovered ${fragment.discoveredAt.toLocaleDateString()}`
                      : "Locked"}
                  </div>

                  {fragment.isUnlocked && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Read More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-game-accent" />
                            {fragment.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge className={getRarityColor(fragment.rarity)}>
                              {fragment.rarity}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getCategoryColor(fragment.category)}
                            >
                              {fragment.category}
                            </Badge>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {fragment.content}
                          </p>
                          <div className="text-xs text-muted-foreground pt-4 border-t">
                            Discovered at Node {fragment.nodeId} on{" "}
                            {fragment.discoveredAt.toLocaleDateString()}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFragments.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No fragments found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
