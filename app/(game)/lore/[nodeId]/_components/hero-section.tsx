"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react"; // Assuming lucide-react for icons
import { motion } from "framer-motion"; // For animations
import Map, { Marker } from "react-map-gl/maplibre";
import { useTheme } from "next-themes";

import { getRarityInfo, MAP_STYLES } from "@/app/(game)/map/utils";
import { NodeMarker } from "@/app/(game)/_components/node-markers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationLore } from "../services";

interface HeroSectionProps {
  lore: LocationLore;
}

export default function HeroSection({ lore }: HeroSectionProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { resolvedTheme } = useTheme();

  const initialViewState = {
    latitude: lore.node.latitude,
    longitude: lore.node.longitude,
    zoom: 16,
  };

  useEffect(() => {
    // Mock audio - in prod, generate based on audioThemes
    const sound = new Audio("/sounds/forest-ambience.mp3"); // Placeholder
    setAudio(sound);
    return () => sound.pause();
  }, []);

  const toggleAudio = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative h-full overflow-hidden" // Cosmic gradient via CSS vars
      style={{
        background: `linear-gradient(to bottom, var(--background), var(--primary))`,
      }}
    >
      <div className="absolute inset-0 opacity-50" />{" "}
      {/* Particle overlay placeholder */}
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ECHO NODE #π-{lore.nodeId}: THE ETERNAL WHISPER OF{" "}
            {lore.city?.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between">
          <div className="w-full md:w-1/2 h-40">
            <Map
              initialViewState={initialViewState}
              style={{ width: "100%", height: "100%" }}
              mapStyle={
                resolvedTheme === "light"
                  ? MAP_STYLES.outdoor
                  : MAP_STYLES.outdoorDark
              }
              attributionControl={false}
            >
              {/* Node Marker */}

              <Marker
                key={lore.nodeId}
                longitude={lore.node.longitude}
                latitude={lore.node.latitude}
              >
                <NodeMarker nodeColor={getRarityInfo(lore.node.type.rarity)} />
              </Marker>
            </Map>
          </div>
          <div className="w-full md:w-1/2 flex flex-wrap gap-2 justify-center mt-4 md:mt-0">
            <Badge variant="secondary">Rarity: {lore.node.type.rarity}</Badge>
            <Badge variant="secondary">Type: {lore.node.type.name}</Badge>
            <Badge variant="secondary">Level: {lore.currentLevel}/5</Badge>
            <Badge variant="secondary">
              Pi Staked: {lore.totalPiStaked.toDecimalPlaces(2).toString()} by{" "}
              {lore.stakes.length}
            </Badge>
            <Button variant="ghost" onClick={toggleAudio}>
              <Volume2 className="mr-2" /> {isPlaying ? "Pause" : "Play"}{" "}
              Ambient
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
