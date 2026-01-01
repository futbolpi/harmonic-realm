import { Card } from "@/components/ui/card";

type NewlyCreatedProps = {
  newly: {
    id: string;
    emblem: string;
    name: string;
    maxMembers: number;
    _count: { members: number };
  }[];
};

const NewlyCreated = ({ newly }: NewlyCreatedProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🆕 Newly Created Guilds</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {newly.map((g) => (
          <Card key={g.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{g.emblem}</div>
              <div>
                <h4 className="font-semibold">{g.name}</h4>
                <div className="text-xs text-muted-foreground">
                  {g._count.members}/{g.maxMembers}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewlyCreated;
