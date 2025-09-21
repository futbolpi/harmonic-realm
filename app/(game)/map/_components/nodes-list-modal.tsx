"use client";

import { List } from "lucide-react";
import { useState } from "react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaTitle,
  CredenzaHeader,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { NodesList } from "./nodes-list";

type NodesListModalProps = {
  filteredAndSortedNodes: Node[];
  selectedNode: Node | null;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  handleNodeClick: (node: Node) => void;
  handleNodeDetails: (nodeId: string) => void;
};

export function NodesListModal({
  filteredAndSortedNodes,
  handleNodeClick,
  handleNodeDetails,
  selectedNode,
  userLocation,
}: NodesListModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const onNodeClick = (node: Node) => {
    handleNodeClick(node);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen} className="shadow-lg" id="list-button">
        <List className="h-4 w-4 mr-2" />
        Nodes List
      </Button>

      <Credenza open={open} onOpenChange={setOpen}>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>
              Nearby Nodes ({filteredAndSortedNodes.length})
            </CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="p-4 max-h-96 overflow-y-auto">
              <NodesList
                nodes={filteredAndSortedNodes}
                selectedNode={selectedNode}
                userLocation={userLocation}
                onNodeClick={onNodeClick}
                onNodeDetails={handleNodeDetails}
              />
            </div>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </>
  );
}
