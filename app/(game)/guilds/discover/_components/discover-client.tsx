"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import RequestModal from "./request-modal";
import DetailModal from "./detail-modal";
import NewlyCreated from "./newly-created";
import MostActive from "./most-active";
import Recommended from "./recommended";
import type { Guild } from "../services";

export default function DiscoverClient({ guilds }: { guilds: Guild[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("OPEN");
  //   const [sort, setSort] = useState("ACTIVE");
  const [selected, setSelected] = useState<Guild | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const enriched = useMemo(() => {
    // Add synthetic distance and active score for demo
    return guilds.map((g, i) => ({
      ...g,
      distanceKm: (i + 1) * 1.2,
      activeScore: Math.round(Math.random() * 100),
    }));
  }, [guilds]);

  const filtered = useMemo(() => {
    return enriched
      .filter((g) => (filter === "OPEN" ? !g.requireApproval : true))
      .filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));
  }, [enriched, filter, query]);

  const recommended = filtered.slice(0, 3);
  const mostActive = filtered
    .slice(0, 5)
    .sort((a, b) => b.activeScore - a.activeScore);
  const newly = filtered
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const openDetails = (g: Guild) => {
    setSelected(g);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                You&apos;re not in a guild yet
              </h2>
              <p className="text-sm text-muted-foreground">
                Joining a guild unlocks bonuses, rewards, and social features.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/guilds/create">
                <Button>Create Guild</Button>
              </Link>
              <Link href="/guilds">
                <Button variant="outline">Browse Guilds</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <Card>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Guild name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select onValueChange={(v) => setFilter(v)} defaultValue="OPEN">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ALL">All</SelectItem>
              </SelectContent>
            </Select>
            {/* <Select onValueChange={(v) => setSort(v)} defaultValue="ACTIVE">
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="NEAR">Near Me</SelectItem>
                <SelectItem value="RF">Min RF</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Recommended */}
      <Recommended
        openDetails={openDetails}
        recommended={recommended}
        setSelected={setSelected}
        setShowRequestModal={setShowRequestModal}
      />

      {/* Most Active */}
      <MostActive
        mostActive={mostActive.map((g) => ({
          _count: {
            members: g._count.members,
            territories: 0,
          },
          emblem: g.emblem,
          id: g.id,
          maxMembers: g.maxMembers,
          name: g.name,
          vaultLevel: g.vaultLevel,
        }))}
      />

      {/* Newly Created */}
      <NewlyCreated
        newly={newly.map((g) => ({
          _count: { members: g._count.members },
          emblem: g.emblem,
          id: g.id,
          maxMembers: g.maxMembers,
          name: g.name,
        }))}
      />

      {/* Detail Credenza */}
      {selected && (
        <DetailModal
          selected={{
            _count: { members: selected._count.members },
            description: selected.description || "",
            emblem: selected.emblem,
            maxMembers: selected.maxMembers,
            minRF: selected.minRF,
            name: selected.name,
            requireApproval: selected.requireApproval,
            totalSharePoints: selected.totalSharePoints,
            vaultLevel: selected.vaultLevel,
          }}
          setShowDetail={setShowDetail}
          setShowRequestModal={setShowRequestModal}
          showDetail={showDetail}
        />
      )}

      {/* Request Modal */}
      {selected && (
        <RequestModal
          guild={{
            id: selected.id,
            minRF: selected.minRF,
            requireApproval: selected.requireApproval,
            _count: { members: selected._count.members },
            maxMembers: selected.maxMembers,
          }}
          setShowRequestModal={setShowRequestModal}
          setShowDetail={setShowDetail}
          showRequestModal={showRequestModal}
        />
      )}
    </div>
  );
}
