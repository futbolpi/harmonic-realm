"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AdvancedCard = ({ isLeader }: { isLeader: boolean }) => {
  const [isDisbanding, startTransition] = useTransition();
  const [disbandConfirm, setDisbandConfirm] = useState("");
  const router = useRouter();

  const confirmDisband = () => {
    if (!isLeader) return toast.error("Only leader can disband guild");
    if (disbandConfirm !== "DISBAND")
      return toast.error("Type DISBAND to confirm");
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Guild disbanded — redirecting...");
      setTimeout(() => router.push("/guilds/discover"), 600);
    });
  };

  if (!isLeader) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* <div>
            <p className="text-sm">Transfer Leadership</p>
            <p className="text-xs text-muted-foreground">Leader only</p>
          </div> */}

          <div>
            <p className="text-sm">Disband Guild</p>
            <p className="text-xs text-muted-foreground">
              This action is irreversible
            </p>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Type DISBAND to confirm"
                value={disbandConfirm}
                onChange={(e) => setDisbandConfirm(e.target.value)}
              />
              <Button
                variant="destructive"
                onClick={confirmDisband}
                disabled={!isLeader || isDisbanding}
              >
                Disband Guild
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCard;
