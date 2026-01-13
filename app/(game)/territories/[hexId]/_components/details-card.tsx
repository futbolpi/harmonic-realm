import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClientTerritoryDetail } from "../utils";
import TerritoryStatsPanel from "./stats-panel";
import TerritoryNodesTable from "./nodes-table";

interface Props {
  territory: ClientTerritoryDetail;
}

const DetailsCard = ({ territory }: Props) => {
  return (
    <Card className="p-6">
      <Tabs className="w-full" defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <TerritoryStatsPanel
            territory={{
              controlledAt: territory.controlledAt,
              daysRemaining: territory.controlStatus.daysRemaining || 0,
              currentStake: territory.currentStake,
              guild: territory.guild,
              noOfNodes: territory.nodes.length,
              trafficScore: territory.trafficScore,
            }}
          />
        </TabsContent>

        <TabsContent value="nodes" className="mt-6">
          <TerritoryNodesTable nodes={territory.nodes} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {territory.challengeHistory.length > 0 ? (
            <div className="space-y-3">
              {territory.challengeHistory.map((challenge) => (
                <div
                  key={challenge.id}
                  className="border border-border/30 rounded-lg p-3 bg-muted/20 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {challenge.defender.name} vs {challenge.attacker.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(challenge.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {challenge.resolved && (
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {challenge.winnerId === challenge.defenderId
                            ? "Defended"
                            : "Captured"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {challenge.defenderScore} vs {challenge.attackerScore}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No challenge history for this territory</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DetailsCard;
