import { Inngest, EventSchemas } from "inngest";

import { SiteId } from "@/config/site";
import { Events } from "./events";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: SiteId,
  schemas: new EventSchemas().fromUnion<Events>(),
});
