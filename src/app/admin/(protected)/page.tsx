import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export default async function AdminDashboardPage() {
  await requireRole(Role.VIEWER);

  const [totalUsers, totalAdmins, totalEditors, totalViewers] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: Role.ADMIN, deletedAt: null } }),
    prisma.user.count({ where: { role: Role.EDITOR, deletedAt: null } }),
    prisma.user.count({ where: { role: Role.VIEWER, deletedAt: null } }),
  ]);

  const widgets = [
    { label: "Total Users", value: totalUsers },
    { label: "Admins", value: totalAdmins },
    { label: "Editors", value: totalEditors },
    { label: "Viewers", value: totalViewers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Overview of template user access.</p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => (
          <article
            key={widget.label}
            className="rounded-xl border border-neutral-200/60 bg-white p-5 dark:border-neutral-800/60 dark:bg-neutral-900"
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{widget.label}</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">{widget.value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
