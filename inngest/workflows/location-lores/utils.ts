import { OverallHealth } from "@/types/system";

export function generateHealthCheckMessage(health: OverallHealth): string {
  const { status, aiHealth, locationHealth, queueHealth } = health;

  // Header with overall status
  let message = `<b>Health Check Report - Harmonic Realm</b>\n`;
  message += `Overall Status: <b>${status}</b>\n\n`;

  // AI Health Section
  message += `<b>AI Health</b>: ${aiHealth.status}\n`;
  message += `Providers:\n`;
  for (const [provider, isHealthy] of Object.entries(aiHealth.providers)) {
    message += `  - ${provider}: ${
      isHealthy ? "✅ Healthy" : "❌ Unhealthy"
    }\n`;
  }
  if (aiHealth.details.length > 0) {
    message += `Details:\n${aiHealth.details
      .map((detail) => `  - ${detail}`)
      .join("\n")}\n`;
  }
  message += "\n";

  // Location Health Section
  message += `<b>Location Health</b>: ${locationHealth.status}\n`;
  if ("error" in locationHealth && locationHealth.error) {
    message += `Error: ${locationHealth.error}\n`;
  }
  message += "\n";

  // Queue Health Section
  message += `<b>Queue Health</b>: ${queueHealth.status}\n`;
  message += `Failure Rate: ${queueHealth.failureRate.toFixed(2)}%\n`;
  message += `Total Jobs: ${queueHealth.totalJobs}\n`;
  message += `Failed Jobs: ${queueHealth.failedJobs}\n`;

  message += "\n";

  // Date

  message += `<b>Timestamp</b>: ${new Date().toISOString()}\n`;

  return message;
}
