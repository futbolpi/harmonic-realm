import { z } from "zod";

export const authResultSchema = z.object({
  accessToken: z.string(),
  referral: z.string().nullable(),
  user: z.object({ uid: z.string(), username: z.string() }),
});

export const userSessionSchema = z
  .object({
    piId: z.string(),
    username: z.string(),
  })
  .nullable();

export const verifyTokenSchema = z.object({
  accessToken: z.string(),
});

export const verifyResultSchema = z.object({
  isValid: z.boolean(),
});

export type AuthResultSchema = z.infer<typeof authResultSchema>;

export type VerifyTokenSchema = z.infer<typeof verifyTokenSchema>;

export type VerifyResultSchema = z.infer<typeof verifyResultSchema>;

export type UserSession = z.infer<typeof userSessionSchema>;

export const defaultValidation: VerifyResultSchema = { isValid: false };

export const defaultSession: UserSession = null;
