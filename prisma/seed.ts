import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local" });
loadEnv();

import { hashSync } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const isAccelerateUrl =
  connectionString.startsWith("prisma://") ||
  connectionString.startsWith("prisma+postgres://");

const prisma = isAccelerateUrl
  ? new PrismaClient({ accelerateUrl: connectionString })
  : new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

async function main() {
  const hashedPassword = hashSync("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@admin.dev" },
    update: {
      name: "Admin User",
      hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      name: "Admin User",
      email: "admin@admin.dev",
      hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Seed complete. Admin credentials: admin@admin.dev / admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
