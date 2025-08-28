import { Inngest, EventSchemas } from "inngest";

import { SiteId } from "@/config/site";
import { Events } from "./events";

/**
 * Type-safe Inngest client for HarmonicRealm
 * Defines all events used throughout the Location Lore system
 */
export const inngest = new Inngest({
  id: SiteId,
  schemas: new EventSchemas().fromUnion<Events>(),
});
