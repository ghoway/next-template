import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const isAccelerateUrl =
  connectionString.startsWith("prisma://") ||
  connectionString.startsWith("prisma+postgres://");

export const prisma =
  globalForPrisma.prisma ??
  (isAccelerateUrl
    ? new PrismaClient({ accelerateUrl: connectionString })
    : new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
      }));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
