import { z } from "zod";

import { GuildRole } from "@/lib/generated/prisma/enums";

/**
 * Schema for updating guild member role
 */
export const UpdateRoleSchema = z.object({
  role: z.enum(GuildRole).exclude(["LEADER"]),
  accessToken: z.string().min(1, "Access token is required"),
  memberId: z.string().min(1, "Guild Member Id is required"),
});

/**
 * Schema for removing guild member
 */
export const RemoveMemberSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  memberId: z.string().min(1, "Guild Member Id is required"),
});

export type UpdateRoleParams = z.infer<typeof UpdateRoleSchema>;

export type RemoveMemberParams = z.infer<typeof RemoveMemberSchema>;
