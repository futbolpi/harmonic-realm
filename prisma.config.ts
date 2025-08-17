import path from "node:path";
import type { PrismaConfig } from "prisma";
import "dotenv/config";

export default {
  schema: path.join("prisma"),
  migrations: {
    seed: `tsx prisma/seed.ts`,
  },
} satisfies PrismaConfig;
