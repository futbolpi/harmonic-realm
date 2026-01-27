"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getEffectIcon,
  getRarityColor,
  getEffectDescription,
} from "@/lib/utils/guild/artifacts-utils";
import { formatArtifactEffect } from "@/lib/utils/guild/artifact";
import type {
  ArtifactEffectType,
  ArtifactRarity,
} from "@/lib/generated/prisma/enums";
import ResonateModal from "./resonate-modal";

type AvailableTemplatesProps = {
  templates: {
    id: string;
    name: string;
    description: string;
    rarity: ArtifactRarity;
    effectType: ArtifactEffectType;
    baseValue: number;
    echoShardsCost: number;
    resonanceCost: number;
    minVaultLevel: number;
    loreText: string;
  }[];
  currentVaultLevel: number;
  guildId: string;
};

export default function AvailableTemplates({
  templates,
  currentVaultLevel,
  guildId,
}: AvailableTemplatesProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Available Artifacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All available artifacts have been started. Upgrade your vault level
            to unlock more powerful artifacts!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Available Artifacts ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.map((template) => {
              const effectIcon = getEffectIcon(template.effectType);
              const rarityColor = getRarityColor(template.rarity);
              const isLocked = template.minVaultLevel > currentVaultLevel;

              return (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border ${
                    isLocked
                      ? "opacity-50 border-border/50 bg-muted/30"
                      : "border-border bg-card hover:border-primary/30 transition-colors"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{effectIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {template.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${rarityColor} whitespace-nowrap`}
                        >
                          {template.rarity}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {getEffectDescription(template.effectType)}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap text-xs mb-3">
                        <span className="font-medium">
                          {formatArtifactEffect(
                            template.effectType,
                            template.baseValue,
                          )}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {template.echoShardsCost} shards
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {template.resonanceCost} RESONANCE
                        </span>
                      </div>

                      {isLocked ? (
                        <div className="text-xs text-red-500">
                          🔒 Requires Vault Level {template.minVaultLevel}
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground italic mb-2 pb-2 border-t">
                            {template.loreText}
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedTemplateId(template.id)}
                            className="w-full"
                          >
                            Resonate Shards
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <ResonateModal
          open={selectedTemplateId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTemplateId(null);
          }}
          template={{
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            minVaultLevel: selectedTemplate.minVaultLevel,
          }}
          guildId={guildId}
          guildVaultLevel={currentVaultLevel}
        />
      )}
    </>
  );
}
