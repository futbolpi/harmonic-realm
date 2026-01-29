import { GUILD_ACTIVITIES } from "@/config/guilds/constants";
import prisma from "@/lib/prisma";

type AwardSPParams = {
  memberId?: string;
  sharePoints: number;
  completedMining?: boolean;
  perfectTuning?: boolean;
};

export const getMemberBonus = async (username: string) => {
  const member = await prisma.guildMember.findUnique({
    where: { username, isActive: true },
    select: { id: true, guild: { select: { id: true, vaultLevel: true } } },
  });

  if (!member) {
    return { member };
  }

  const level = await prisma.vaultUpgrade.findUnique({
    where: { level: member.guild.vaultLevel },
    select: { sharePointsBonus: true },
  });

  return { member, level };
};

export const awardMemberSP = async ({
  memberId,
  sharePoints,
  completedMining,
  perfectTuning,
}: AwardSPParams) => {
  if (!memberId) {
    return;
  }
  const increment = sharePoints;

  const totalNodesMined = completedMining ? { increment: 1 } : undefined;
  const totalTunesPerfect = perfectTuning ? { increment: 1 } : undefined;
  const weeklyActivity = completedMining
    ? { increment: GUILD_ACTIVITIES.mining.weeklyActivity }
    : { increment: GUILD_ACTIVITIES.tuning.weeklyActivity };

  await prisma.guildMember.update({
    where: { id: memberId, isActive: true },
    data: {
      totalSharePoints: { increment },
      weeklySharePoints: { increment },
      guild: {
        update: {
          totalNodesMined,
          totalTunesPerfect,
          totalSharePoints: { increment },
          weeklyActivity,
        },
      },
    },
    select: { id: true },
  });
};
