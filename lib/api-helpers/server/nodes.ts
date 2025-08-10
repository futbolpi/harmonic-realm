import { type Node } from "@/lib/schema/node";

export // Mock server-side data fetching
async function getNodes(): Promise<Node[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock nodes data - in real app, fetch from database
  return [
    {
      id: "node_1",
      latitude: 40.7829,
      longitude: -73.9654,
      openForMining: true,
      type: {
        id: 1,
        name: "Urban Hub",
        baseYieldPerMinute: 2.5,
        maxMiners: 10,
        lockInMinutes: 15,
        rarity: "Uncommon",
        iconUrl: "/placeholder.svg?height=32&width=32&text=🏢",
      },
    },
    {
      id: "node_2",
      latitude: 40.758,
      longitude: -73.9855,
      openForMining: true,
      sponsor: "Starbucks",
      type: {
        id: 2,
        name: "Community Center",
        baseYieldPerMinute: 1.8,
        maxMiners: 15,
        lockInMinutes: 10,
        rarity: "Common",
        iconUrl: "/placeholder.svg?height=32&width=32&text=☕",
      },
    },
    {
      id: "node_3",
      latitude: 40.7614,
      longitude: -73.9776,
      openForMining: true,
      type: {
        id: 3,
        name: "Landmark",
        baseYieldPerMinute: 4.0,
        maxMiners: 5,
        lockInMinutes: 30,
        rarity: "Epic",
        iconUrl: "/placeholder.svg?height=32&width=32&text=🗽",
      },
    },
    {
      id: "node_4",
      latitude: 40.7505,
      longitude: -73.9934,
      openForMining: false,
      type: {
        id: 4,
        name: "Rare Node",
        baseYieldPerMinute: 6.0,
        maxMiners: 3,
        lockInMinutes: 45,
        rarity: "Legendary",
        iconUrl: "/placeholder.svg?height=32&width=32&text=💎",
      },
    },
    {
      id: "node_5",
      latitude: 40.7282,
      longitude: -74.0776,
      openForMining: true,
      type: {
        id: 1,
        name: "Local Node",
        baseYieldPerMinute: 1.2,
        maxMiners: 20,
        lockInMinutes: 5,
        rarity: "Common",
        iconUrl: "/placeholder.svg?height=32&width=32&text=📍",
      },
    },
    {
      id: "node_6",
      latitude: 40.7589,
      longitude: -73.9851,
      openForMining: true,
      sponsor: "McDonald's",
      type: {
        id: 2,
        name: "Community Center",
        baseYieldPerMinute: 2.0,
        maxMiners: 12,
        lockInMinutes: 12,
        rarity: "Uncommon",
        iconUrl: "/placeholder.svg?height=32&width=32&text=🍔",
      },
    },
  ];
}
