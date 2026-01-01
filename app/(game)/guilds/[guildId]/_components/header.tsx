import { Diamond } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HeaderSettings from "./header-settings";

type Props = {
  guild: {
    name: string;
    id: string;
    emblem: string;
    tag: string;
    leaderUsername: string;
    piTransactionId: string | null;
    vaultLevel: number;
    maxMembers: number;
    activeMembers: number;
  };
};

const Header = ({ guild }: Props) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{guild.emblem}</div>
          <div>
            <h1 className="text-2xl font-bold">{guild.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {guild.emblem} {guild.tag}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {guild.leaderUsername}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="text-right mr-4">
          <p className="text-sm font-medium">
            {guild.vaultLevel ? `Prestige Lv ${guild.vaultLevel}` : "Prestige"}
          </p>
          <p className="text-xs text-muted-foreground">
            {guild.activeMembers} / {guild.maxMembers} Members
          </p>
        </div>
        {guild.piTransactionId && (
          <Button asChild variant="ghost" size="icon" aria-label="Guild vault">
            <Link href={`/guilds/${guild.id}/vault`}>
              <Diamond className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <HeaderSettings
          guildId={guild.id}
          leaderUsername={guild.leaderUsername}
        />
      </div>
    </div>
  );
};

export default Header;
