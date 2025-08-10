import axios from "axios";

import { env } from "@/env";

const platformAPIClient = axios.create({
  baseURL: env.PI_PLATFORM_API_URL,
  timeout: 20000,
  headers: { Authorization: `Key ${env.PI_API_KEY}` },
});

export const isValidAccessToken = async (accessToken: string) => {
  try {
    // Verify the user's access token with the /me endpoint:
    await platformAPIClient.get(`/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return true;
  } catch (err) {
    console.error("[INVALID_ACCESS_TOKEN]", err);
    return false;
  }
};

export default platformAPIClient;
