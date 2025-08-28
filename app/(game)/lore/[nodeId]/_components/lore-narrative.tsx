// components/lore/LoreNarrative.tsx (Client for Accordion Interactivity)
"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/shared/user-avatar";
import { LocationLore } from "../services";

interface LoreNarrativeProps {
  lore: LocationLore;
}

const loreTiers = [
  { level: 1, key: "basicHistory", title: "Basic History" },
  { level: 2, key: "culturalSignificance", title: "Cultural Significance" },
  { level: 3, key: "mysticInterpretation", title: "Mystic Interpretation" },
  { level: 4, key: "epicNarrative", title: "Epic Narrative" },
  { level: 5, key: "legendaryTale", title: "Legendary Tale" },
] as const;

export default function LoreNarrative({ lore }: LoreNarrativeProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {loreTiers.map(({ level, key, title }) => {
            const content = lore[key as keyof LocationLore] as
              | string
              | null
              | undefined;
            const isUnlocked = level <= lore.currentLevel;

            return (
              <AccordionItem key={level} value={`level-${level}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Badge variant={isUnlocked ? "default" : "outline"}>
                      {level}
                    </Badge>
                    {title} {isUnlocked ? "(Unlocked)" : "(Locked)"}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {isUnlocked && content ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[--muted-foreground] italic"
                    >
                      {content}
                    </motion.p>
                  ) : (
                    <p className="text-[--muted-foreground] blur-sm">
                      Whispers of cosmic binding await... Stake Pi to unveil.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Contributors Spotlight</h3>
          <div className="flex gap-4 overflow-x-auto">
            {lore.contributors.map((contrib) => (
              <Card key={contrib.username} className="min-w-[150px]">
                <CardContent className="p-4 text-center">
                  <UserAvatar size={48} userId={contrib.username} />
                  <p>{contrib.username}</p>
                  <Badge variant="secondary">{contrib.tier}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
