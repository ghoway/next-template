import { Role } from "@prisma/client";

import { UsersManagement } from "@/features/admin/components/users-management";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  await requireRole(Role.ADMIN);

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

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Users Management</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        All user actions are handled through confirmation modals.
      </p>

      <div className="mt-6">
        <UsersManagement
          initialUsers={users.map((user) => ({
            ...user,
            createdAt: user.createdAt.toISOString().slice(0, 10),
            deletedAt: user.deletedAt ? user.deletedAt.toISOString().slice(0, 10) : null,
          }))}
        />
      </div>
    </div>
  );
}
