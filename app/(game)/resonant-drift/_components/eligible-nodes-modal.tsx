"use client";

import React, { Dispatch, SetStateAction } from "react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaDescription,
  CredenzaTitle,
} from "@/components/credenza";
import { DriftNodeWithCost } from "@/lib/schema/drift";
import NodesTable from "./nodes-table";

type Props = {
  showNodesModal: boolean;
  setShowNodesModal: Dispatch<SetStateAction<boolean>>;
  nodesToRender: DriftNodeWithCost[];
  onRowClick: (node: DriftNodeWithCost) => void;
};

const EligibleNodesModal = ({
  nodesToRender,
  setShowNodesModal,
  showNodesModal,
  onRowClick,
}: Props) => {
  return (
    <Credenza open={showNodesModal} onOpenChange={setShowNodesModal}>
      <CredenzaContent className="max-h-[80vh]">
        <CredenzaHeader>
          <CredenzaTitle>Eligible Drift Nodes</CredenzaTitle>
          <CredenzaDescription>
            {nodesToRender.length} dormant nodes detected within 100km
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody>
          {nodesToRender.length > 0 ? (
            <NodesTable nodesToRender={nodesToRender} onRowClick={onRowClick} />
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No eligible nodes available
            </p>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};

export default EligibleNodesModal;
