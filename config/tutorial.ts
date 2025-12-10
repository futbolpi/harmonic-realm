import { type Node } from "@/lib/schema/node";

export const EPHEMERAL_SPARK_NODE: Node = {
  id: "tutorial-ephemeral-spark",
  name: "Ephemeral Spark (Tutorial)",
  latitude: 0,
  longitude: 0,
  echoIntensity: 1,
  openForMining: true,
  sponsor: null,
  sessions: [],
  locationLore: null,
  type: {
    id: "tutorial-type",
    name: "Ephemeral Spark",
    baseYieldPerMinute: 50,
    maxMiners: 1,
    lockInMinutes: 1,
    rarity: "Common",
    iconUrl: "",
  },
};
