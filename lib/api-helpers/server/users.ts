// Mock user session verification (would typically validate JWT)
export function getUserFromAccessToken(
  accessToken: string
): { piUid: string; piUsername: string } | null {
  // In a real implementation, you would verify the JWT token
  // For now, we'll extract from stored auth or mock it
  try {
    // Mock implementation - in real app, decode JWT
    if (accessToken.startsWith("Bearer ")) {
      return {
        piUid: "mock-uid-" + Date.now(),
        piUsername: "testuser",
      };
    }
    return null;
  } catch {
    return null;
  }
}
