import React from "react";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import SettingsClient from "./_components/settings-client";

export const metadata = {
  title: "Guild Settings",
};

export default async function Page({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      id: true,
      name: true,
      description: true,
      leaderUsername: true,
      emblem: true,
      tag: true,
      isPublic: true,
      autoKickInactive: true,
      minRF: true,
      requireApproval: true,
      paymentId: true,
      piTransactionId: true,
      members: {
        select: {
          role: true,
          username: true,
          id: true,
          isActive: true,
          joinedAt: true,
          user: { select: { resonanceFidelity: true } },
        },
      },
    },
  });

  if (!guild) notFound();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <SettingsClient guild={guild} />
    </div>
  );
}
