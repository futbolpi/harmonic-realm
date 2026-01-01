import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type MostActiveProps = {
  mostActive: {
    id: string;
    emblem: string;
    name: string;
    maxMembers: number;
    vaultLevel: number;
    _count: { members: number; territories: number };
  }[];
};

const MostActive = ({ mostActive }: MostActiveProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🔥 Most Active Guilds</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mostActive.map((g) => (
          <Card key={g.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{g.emblem}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{g.name}</h4>
                    <div className="text-xs text-muted-foreground">
                      {g._count.members}/{g.maxMembers}
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Prestige Lv {g.vaultLevel} • {g._count.territories} zones
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MostActive;
