"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuth } from "@/components/shared/auth/auth-context";
import type { GuildMember } from "@/lib/generated/prisma/browser";
import LeadershipCard from "./leadership-card";
import ActiveMembers from "./active-members";
import LeaderboardCard from "./leaderboard-card";
import ConfirmationModal from "./confirmation-modal";
import ProfileModal from "./profile-modal";

type MembersClientProps = {
  guild: {
    members: GuildMember[];
    leaderUsername: string;
    maxMembers: number;
    id: string;
  };
};

export default function MembersClient({ guild }: MembersClientProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("ACTIVITY");
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(
    null,
  );
  const [showProfile, setShowProfile] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "PROMOTE" | "REMOVE" | "DEMOTE";
    member: GuildMember;
  } | null>(null);

  const isLeader = user?.username === guild.leaderUsername;
  const members = guild.members;

  const filtered = useMemo(() => {
    let list = [...members];

    if (search.trim()) {
      list = list.filter((m) =>
        m.username.toLowerCase().includes(search.toLowerCase()),
      );
    }

    switch (filter) {
      case "ACTIVE":
        list = list.filter((m) => (m.weeklySharePoints ?? 0) > 0);
        break;
      case "INACTIVE":
        list = list.filter((m) => (m.weeklySharePoints ?? 0) === 0);
        break;
      case "OFFICERS":
        list = list.filter((m) => m.role === "OFFICER");
        break;
      case "LEADERS":
        list = list.filter((m) => m.role === "LEADER");
        break;
    }

    switch (sort) {
      case "CONTRIBUTIONS":
        list.sort(
          (a, b) => (b.vaultContribution ?? 0) - (a.vaultContribution ?? 0),
        );
        break;
      case "JOIN_DATE":
        list.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
        break;
      case "NAME":
        list.sort((a, b) => a.username.localeCompare(b.username));
        break;
      default:
        // ACTIVITY
        list.sort(
          (a, b) => (b.weeklySharePoints ?? 0) - (a.weeklySharePoints ?? 0),
        );
        break;
    }

    return list;
  }, [members, search, filter, sort]);

  const leader = members.find((m) => m.role === "LEADER");
  const officers = members.filter((m) => m.role === "OFFICER");
  const activeCount = members.filter(
    (m) => (m.weeklySharePoints ?? 0) > 0,
  ).length;

  const handleAction = (
    member: GuildMember,
    type: "PROMOTE" | "REMOVE" | "DEMOTE",
  ) => {
    setConfirmAction({ type, member });
  };

  const openProfile = (member: GuildMember) => {
    setSelectedMember(member);
    setShowProfile(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filter Controls - Mobile First */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 sm:gap-1">
          <Select onValueChange={(v) => setFilter(v)} defaultValue="ALL">
            <SelectTrigger className="w-24 sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="OFFICERS">Officers</SelectItem>
              <SelectItem value="LEADERS">Leaders</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setSort(v)} defaultValue="ACTIVITY">
            <SelectTrigger className="w-24 sm:w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVITY">Activity</SelectItem>
              <SelectItem value="CONTRIBUTIONS">Contrib.</SelectItem>
              <SelectItem value="JOIN_DATE">Join Date</SelectItem>
              <SelectItem value="NAME">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leadership */}
      <LeadershipCard
        handleAction={handleAction}
        officers={officers}
        openProfile={openProfile}
        leader={leader}
      />

      {/* Active Members */}
      <ActiveMembers
        activeCount={activeCount}
        filtered={filtered}
        handleAction={handleAction}
        isLeader={isLeader}
        openProfile={openProfile}
      />

      {/* Leaderboard */}
      <LeaderboardCard members={members} />

      {/* Confirm Modal */}
      <ConfirmationModal
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
      />

      {/* Profile Modal */}
      <ProfileModal
        handleAction={handleAction}
        isLeader={isLeader}
        selectedMember={selectedMember}
        setShowProfile={setShowProfile}
        showProfile={showProfile}
      />
    </div>
  );
}
