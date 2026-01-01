import { parseAsString, createLoader } from "nuqs/server";

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const guildJoinSearchParams = {
  guildId: parseAsString,
};

export const loadSearchParams = createLoader(guildJoinSearchParams);
