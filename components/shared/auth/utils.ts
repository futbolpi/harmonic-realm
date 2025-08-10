import {
  defaultValidation,
  UserSession,
  verifyResultSchema,
  AuthResultSchema,
  defaultSession,
  userSessionSchema,
} from "@/lib/schema/auth";

// Verify token function
export const verifyToken = async (
  token: string
): Promise<{ isValid: boolean }> => {
  try {
    // In a real app, you would verify with your backend
    // For now, we'll simulate verification
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token }),
    });

    if (!response.ok) {
      return defaultValidation;
    }

    const json = await response.json();
    const data = verifyResultSchema.safeParse(json);
    if (!data.success) return defaultValidation;
    return data.data;
  } catch (error) {
    console.error("Token verification error:", error);
    return defaultValidation;
  }
};

// sign-in function
export const signIn = async (
  params: AuthResultSchema
): Promise<UserSession> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return defaultSession;
    }

    const json = await response.json();
    const data = userSessionSchema.safeParse(json);
    if (!data.success) return defaultSession;
    return data.data;
  } catch (error) {
    console.error("Token verification error:", error);
    return defaultSession;
  }
};
