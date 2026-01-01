import type { GuildRole } from "../generated/prisma/enums";

export const canUserJoin = ({
  hasActiveMembership,
  guild,
  userRF,
}: {
  hasActiveMembership: boolean;
  guild: { minRF: number; maxMembers: number; noOfMembers: number };
  userRF: number;
}) => {
  if (hasActiveMembership) {
    return {
      canJoin: false,
      reason: "Already hava an active membership",
    };
  }

  if (guild.minRF > userRF) {
    return {
      canJoin: false,
      reason: "Insufficient rf points",
    };
  }

  if (guild.maxMembers <= guild.noOfMembers) {
    return {
      canJoin: false,
      reason: "Guild at max capacity",
    };
  }

  return { canJoin: true };
};

export const canUserDeposit = ({
  guild,
  user,
  depositAmount,
}: {
  guild: { id: string; piTransactionId: string | null };
  user: { sharePoints: number; guildId: string | null };
  depositAmount: number;
}) => {
  if (!user.guildId || user.guildId !== guild.id) {
    return {
      canDeposit: false,
      reason: "Not a member",
    };
  }

  if (!guild.piTransactionId) {
    return {
      canDeposit: false,
      reason: "Inactive Guild",
    };
  }

  if (user.sharePoints < depositAmount) {
    return {
      canDeposit: false,
      reason: "Insufficient balance",
    };
  }

  return { canDeposit: true };
};

export const canUserUpgrade = ({
  guildMembership,
  guildToUpgradeId,
  upgradeCost,
}: {
  guildMembership: {
    guild: {
      vaultBalance: number;
      vaultLevel: number;
      id: string;
    };
    role: GuildRole;
  } | null;
  guildToUpgradeId: string;
  upgradeCost?: number;
}) => {
  if (!guildMembership || guildMembership.guild.id !== guildToUpgradeId) {
    return {
      canUpgrade: false,
      reason: "Not a guild member",
    };
  }

  if (guildMembership.role === "MEMBER") {
    return {
      canUpgrade: false,
      reason: "Insufficient permissions",
    };
  }

  if (guildMembership.guild.vaultLevel >= 10) {
    return {
      canUpgrade: false,
      reason: "Max level reached",
    };
  }

  if (upgradeCost && guildMembership.guild.vaultBalance < upgradeCost) {
    return {
      canUpgrade: false,
      reason: "Insufficient vault balance",
    };
  }

  return { canUpgrade: true };
};
