// ts-ignore 7017 is used to ignore the error that the global object is not
// defined in the global scope. This is because the global object is only
// defined in the global scope in Node.js and not in the browser.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/env";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export type GetDbParams = {
  connectionString: string;
};

export function getDb({ connectionString }: GetDbParams) {
  const adapter =
    env.NODE_ENV !== "production"
      ? new PrismaPg({ connectionString })
      : new PrismaNeon({ connectionString });

  const prisma = new PrismaClient({ adapter });

  return prisma;
}

export const prisma =
  globalForPrisma.prisma || getDb({ connectionString: env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
