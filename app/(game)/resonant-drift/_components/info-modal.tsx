"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
} from "@/components/credenza";
import { Button } from "@/components/ui/button";

interface Props {
  showInfoModal: boolean;
  setShowInfoModal: Dispatch<SetStateAction<boolean>>;
}

const InfoModal = ({ setShowInfoModal, showInfoModal }: Props) => {
  return (
    <Credenza open={showInfoModal} onOpenChange={setShowInfoModal}>
      <CredenzaContent className="p-4 max-w-lg">
        <CredenzaHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CredenzaTitle>Resonant Drift</CredenzaTitle>
              <CredenzaDescription>Key mechanics & quick tips</CredenzaDescription>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Tip</span>
              <div className="mt-1">
                <span className="bg-muted rounded-full px-2 py-1 text-xs">Know the void radius</span>
              </div>
            </div>
          </div>
        </CredenzaHeader>

        <CredenzaBody className="space-y-3 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-sm mb-2">
              The Void Zone (Red Circle)
            </h3>
            <p className="text-sm text-muted-foreground">
              The 10km safe zone around your location. Nodes here are protected
              and cannot be drifted to. You must venture beyond this zone to
              access drift opportunities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Cooldown</h3>
            <p className="text-sm text-muted-foreground">
              After drifting, pioneers enter a 72-hour cooldown before they can
              drift again. Make sure your last drift was more than 72 hours
              ago for new opportunities to appear.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Grid Lines</h3>
            <p className="text-sm text-muted-foreground">
              1km binned drift zones within the void. These represent potential
              spawn locations for drifted resonance.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Eligible Nodes</h3>
            <p className="text-sm text-muted-foreground">
              Glowing nodes beyond the 10km zone. These are active drift targets
              that meet the eligibility criteria. Tap a node to initiate a
              drift.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Dimmed Nodes</h3>
            <p className="text-sm text-muted-foreground">
              Nodes within the safe zone are shown as dimmed and unavailable for
              drifting.
            </p>
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button onClick={() => setShowInfoModal(false)} className="w-full">
            Got It
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default InfoModal;
