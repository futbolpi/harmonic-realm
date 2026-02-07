import type { SurgeNode } from "./services";

/**
 * Memory-based filters (avoid additional DB queries)
 */
export function filterSurges(
  surges: SurgeNode[],
  filters: {
    status?: "active" | "stabilized" | "all";
    minRank?: number;
    maxRank?: number;
  },
) {
  let filtered = surges;

  if (filters.status === "active") {
    filtered = filtered.filter((s) => !s.isStabilized);
  } else if (filters.status === "stabilized") {
    filtered = filtered.filter((s) => s.isStabilized);
  }

  if (filters.minRank) {
    filtered = filtered.filter((s) => s.hexRank >= filters.minRank!);
  }

  if (filters.maxRank) {
    filtered = filtered.filter((s) => s.hexRank <= filters.maxRank!);
  }

  return filtered;
}
