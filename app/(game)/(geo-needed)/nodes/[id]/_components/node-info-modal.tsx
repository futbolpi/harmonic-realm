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
    <Credenza>
      <CredenzaTrigger asChild>
        <Button size="icon" className="shadow-lg rounded-full">
          <Info className="h-4 w-4" />
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
  );
};

export default NodeInfoModal;
