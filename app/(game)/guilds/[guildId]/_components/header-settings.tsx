"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/shared/auth/auth-context";

interface Props {
  guildId: string;
  leaderUsername: string;
}

const HeaderSettings = ({ guildId, leaderUsername }: Props) => {
  const router = useRouter();

  const { user } = useAuth();

  if (user?.username !== leaderUsername) {
    return null;
  }

  return (
    <Button
      onClick={() => router.push(`/guilds/${guildId}/settings`)}
      variant="ghost"
      size="icon"
      aria-label="Guild settings"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};

export default HeaderSettings;
