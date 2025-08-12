"use client";

import { Info } from "lucide-react";

import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";
import { Node } from "@/lib/schema/node";
import { NodeInfoContent } from "./node-info-content";

type NodeInfoModalProps = { node: Node };

const NodeInfoModal = ({ node }: NodeInfoModalProps) => {
  return (
    <div className="absolute bottom-4 left-4">
      <Credenza>
        <CredenzaTrigger asChild>
          <Button size="sm" className="shadow-lg game-button">
            <Info className="mr-2 h-4 w-4" />
            Node Info
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Node Details</CredenzaTitle>
          </CredenzaHeader>
          <div className="p-4">
            <NodeInfoContent node={node} />
          </div>
        </CredenzaContent>
      </Credenza>
    </div>
  );
};

export default NodeInfoModal;
