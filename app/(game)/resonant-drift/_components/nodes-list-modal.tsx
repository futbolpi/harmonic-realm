"use client";

import { List } from "lucide-react";

import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import type { DriftNodeWithCost } from "@/lib/schema/drift";
import { DriftNodesList } from "./drift-nodes-list";

type Props = {
  nodesToRender: DriftNodeWithCost[];
  handleNodeClick: (node: DriftNodeWithCost) => void;
  nodeCountWithin10km: number;
  cheapestCost?: number;
};

const NodesListModal = ({
  nodesToRender,
  handleNodeClick,
  nodeCountWithin10km,
  cheapestCost,
}: Props) => {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          size="lg"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 shadow-xl gap-2"
        >
          <List className="h-4 w-4" />
          View {nodesToRender.length} Nodes
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="h-[70vh] p-2">
        <Tabs defaultValue="list" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Node List</TabsTrigger>
            <TabsTrigger value="stats">Quick Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1 overflow-hidden">
            <DriftNodesList
              nodes={nodesToRender}
              onNodeClick={handleNodeClick}
            />
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-auto">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {nodesToRender.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Nodes
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {nodesToRender.filter((n) => n.canDrift).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Affordable
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {cheapestCost?.toLocaleString() ?? "—"} SP
                  </div>
                  <div className="text-sm text-muted-foreground">Cheapest</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {nodeCountWithin10km}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Nearby Nodes
                  </div>
                </div>
              </div>

              {/* Rarity breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Rarity Distribution</h4>
                {["Legendary", "Epic", "Rare", "Uncommon", "Common"].map(
                  (rarity) => {
                    const count = nodesToRender.filter(
                      (n) => n.rarity === rarity,
                    ).length;
                    if (count === 0) return null;
                    return (
                      <div
                        key={rarity}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{rarity}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CredenzaContent>
    </Credenza>
  );
};

export default NodesListModal;
