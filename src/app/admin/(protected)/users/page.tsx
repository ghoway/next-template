import { Prisma } from "@prisma/client";

import { UsersManagement } from "@/features/admin/components/users-management";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      deletedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const availableRoles = await prisma.role
    .findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        level: true,
        isSystem: true,
      },
      orderBy: [{ level: "desc" }, { name: "asc" }],
    })
    .catch((error) => {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021" &&
        String(error.meta?.modelName ?? "") === "Role"
      ) {
        return [
          {
            id: "system-admin",
            key: "ADMIN",
            name: "Admin",
            description: "Full access to all admin features.",
            level: 100,
            isSystem: true,
          },
          {
            id: "system-users",
            key: "USERS",
            name: "Users",
            description: "Default role for regular application users.",
            level: 10,
            isSystem: true,
          },
        ];
      }

      throw error;
    });

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Users Management</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Here you can manage users, control roles, and keep access secure across your application.
      </p>

      <div className="mt-6">
        <UsersManagement
          initialUsers={users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString().slice(0, 10),
            deletedAt: user.deletedAt ? user.deletedAt.toISOString().slice(0, 10) : null,
          }))}
          initialRoles={availableRoles}
        />
      </div>
    </div>
  );
}
