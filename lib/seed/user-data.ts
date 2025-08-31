import { v4 as uuidv4 } from "uuid";
import { subDays, subHours } from "date-fns";

import { nodesData, nodeTypesData } from "./node-data";
import { MiningSession } from "../generated/prisma/client";
import { binLatLon } from "../node-spawn/region-metrics";

// 10 User instances with varying progress
export const usersData = [
  {
    id: uuidv4(),
    piId: "pi_user_1",
    username: "PioneerEcho1",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 1000,
    totalEarned: 2400,
    level: 5,
    xp: 3000,
    createdAt: new Date("2025-08-01T10:00:00Z"),
    updatedAt: new Date("2025-08-01T10:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_2",
    username: "PioneerWave2",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 800,
    totalEarned: 1800,
    level: 4,
    xp: 2000,
    createdAt: new Date("2025-08-02T12:00:00Z"),
    updatedAt: new Date("2025-08-02T12:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_3",
    username: "PioneerPulse3",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 600,
    totalEarned: 1200,
    level: 3,
    xp: 1000,
    createdAt: new Date("2025-08-03T14:00:00Z"),
    updatedAt: new Date("2025-08-03T14:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_4",
    username: "PioneerResonance4",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 400,
    totalEarned: 800,
    level: 2,
    xp: 500,
    createdAt: new Date("2025-08-04T16:00:00Z"),
    updatedAt: new Date("2025-08-04T16:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_5",
    username: "PioneerHarmony5",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 200,
    totalEarned: 400,
    level: 2,
    xp: 300,
    createdAt: new Date("2025-08-05T18:00:00Z"),
    updatedAt: new Date("2025-08-05T18:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_6",
    username: "PioneerVibe6",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 100,
    totalEarned: 200,
    level: 1,
    xp: 150,
    createdAt: new Date("2025-08-06T20:00:00Z"),
    updatedAt: new Date("2025-08-06T20:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_7",
    username: "PioneerChord7",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 50,
    totalEarned: 100,
    level: 1,
    xp: 80,
    createdAt: new Date("2025-08-07T22:00:00Z"),
    updatedAt: new Date("2025-08-07T22:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_8",
    username: "PioneerRhythm8",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 20,
    totalEarned: 50,
    level: 1,
    xp: 40,
    createdAt: new Date("2025-08-08T10:00:00Z"),
    updatedAt: new Date("2025-08-08T10:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_9",
    username: "PioneerMelody9",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 10,
    totalEarned: 20,
    level: 1,
    xp: 20,
    createdAt: new Date("2025-08-09T12:00:00Z"),
    updatedAt: new Date("2025-08-09T12:00:00Z"),
    archivedAt: null,
  },
  {
    id: uuidv4(),
    piId: "pi_user_10",
    username: "PioneerSeeker10",
    accessToken: `token_${uuidv4()}`,
    sharePoints: 0,
    totalEarned: 0,
    level: 1,
    xp: 0,
    createdAt: new Date("2025-08-10T14:00:00Z"),
    updatedAt: new Date("2025-08-10T14:00:00Z"),
    archivedAt: null,
  },
];

// ~50 MiningSession instances, varying by user (20 to 0), linked to nodes
export const miningSessionsData = (() => {
  const sessions: MiningSession[] = [];
  const userSessionCounts = [20, 15, 10, 8, 5, 2, 1, 1, 1, 0]; // Total: 63
  const usedUserNodePairs = new Set<string>(); // Track unique userId_nodeId

  for (let i = 0; i < usersData.length; i++) {
    const user = usersData[i];
    const sessionCount = userSessionCounts[i];

    for (let j = 0; j < sessionCount; j++) {
      // Randomly select a node
      const node = nodesData[Math.floor(Math.random() * nodesData.length)];
      const nodeType = nodeTypesData.find((nt) => nt.id === node.typeId);
      if (!nodeType) continue; // Skip if nodeType not found

      const userNodeKey = `${user.id}_${node.id}`;
      if (usedUserNodePairs.has(userNodeKey)) continue; // Ensure unique userId_nodeId
      usedUserNodePairs.add(userNodeKey);

      const startTime = subHours(subDays(Date.now(), i), j);
      const isCompleted = Math.random() > 0.3; // ~70% completed
      const endTime = isCompleted
        ? new Date(startTime.getTime() + nodeType.lockInMinutes * 60 * 1000)
        : null;
      const status = isCompleted ? "COMPLETED" : "ACTIVE";
      const shares = isCompleted
        ? nodeType.baseYieldPerMinute * nodeType.lockInMinutes
        : 0;
      const { latitudeBin, longitudeBin } = binLatLon(
        node.latitude,
        node.longitude
      );

      sessions.push({
        id: `session_${i + 1}_${j + 1}_${uuidv4().slice(0, 8)}`,
        createdAt: startTime,
        updatedAt: startTime,
        userId: user.id,
        nodeId: node.id,
        startTime,
        endTime,
        latitudeBin,
        longitudeBin,
        minerSharesEarned: shares,
        status,
        echoTransmissionApplied: false,
        timeReductionPercent: 0,
      });
    }
  }

  return sessions;
})();
