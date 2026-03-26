import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local" });
loadEnv();

import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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
  await prisma.role.upsert({
    where: { key: "ADMIN" },
    update: {
      name: "Admin",
      description: "Full access to all admin features.",
      level: 100,
      isSystem: true,
      deletedAt: null,
    },
    create: {
      key: "ADMIN",
      name: "Admin",
      description: "Full access to all admin features.",
      level: 100,
      isSystem: true,
    },
  });

  await prisma.role.upsert({
    where: { key: "USERS" },
    update: {
      name: "Users",
      description: "Default role for regular application users.",
      level: 10,
      isSystem: true,
      deletedAt: null,
    },
    create: {
      key: "USERS",
      name: "Users",
      description: "Default role for regular application users.",
      level: 10,
      isSystem: true,
    },
  });

  const demoPassword = "loremipsum123";
  const hashedPassword = hashSync(demoPassword, 12);
  const demoEmail = "john.doe@example.com";
  const demoName = "John Doe";

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: demoName,
      hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: demoName,
      email: demoEmail,
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Seed complete. Demo admin credentials: ${demoEmail} / ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
