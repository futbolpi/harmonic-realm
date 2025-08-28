export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type OverallHealth = {
  status: string;
  aiHealth: {
    status: HealthStatus;
    details: string[];
    providers: {
      [x: string]: boolean;
    };
  };
  locationHealth:
    | {
        status: string;
        error: null;
      }
    | {
        status: string;
        error: string;
      };
  queueHealth: {
    status: string;
    failureRate: number;
    totalJobs: number;
    failedJobs: number;
  };
};
