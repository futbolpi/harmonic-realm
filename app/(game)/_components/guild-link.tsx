"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";

import { useProfile } from "@/hooks/queries/use-profile";
import { cn } from "@/lib/utils";

const GuildLink = () => {
  const pathname = usePathname();

  const { data: profile } = useProfile();

  const href = profile?.guildMembership?.guildId
    ? `/guilds/${profile.guildMembership.guildId}`
    : "/guilds/discover";

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
        pathname === href
          ? "text-primary"
          : "text-muted-foreground hover:text-primary"
      )}
    >
      <Landmark className="h-5 w-5" />
      <span>Guild</span>
    </Link>
  );
};

export default GuildLink;
