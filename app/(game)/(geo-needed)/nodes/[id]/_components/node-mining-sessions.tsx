import { History } from "lucide-react";

import { MiningSessionsTable } from "@/app/(game)/_components/mining-sessions-table";
import {
  Credenza,
  CredenzaHeader,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";

type NodeMiningSessionsProps = { node: Node };

const NodeMiningSessions = ({ node }: NodeMiningSessionsProps) => {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="secondary" size="sm" className="shadow-lg">
          <History className="h-4 w-4 mr-2" />
          Sessions
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <CredenzaHeader>
          <CredenzaTitle className="text-game-accent">
            Node Mining History - {node.name}
          </CredenzaTitle>
        </CredenzaHeader>
        <div className="overflow-y-auto">
          <MiningSessionsTable
            sessions={node.sessions}
            isNodeContext={true}
            className="max-h-[60vh] overflow-y-auto"
          />
        </div>
      </CredenzaContent>
    </Credenza>
  );
};

export default NodeMiningSessions;
