import { Role } from "@prisma/client";
import { ArrowRight, ShieldAlert, ShieldCheck, Users, UserSquare2 } from "lucide-react";
import Link from "next/link";

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
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      accent: "from-violet-500/20 to-indigo-500/10",
      href: "/admin/users",
    },
    {
      label: "Admins",
      value: totalAdmins,
      icon: ShieldAlert,
      accent: "from-rose-500/20 to-orange-500/10",
      href: "/admin/users",
    },
    {
      label: "Editors",
      value: totalEditors,
      icon: ShieldCheck,
      accent: "from-sky-500/20 to-cyan-500/10",
      href: "/admin/users",
    },
    {
      label: "Viewers",
      value: totalViewers,
      icon: UserSquare2,
      accent: "from-emerald-500/20 to-teal-500/10",
      href: "/admin/users",
    },
  ];

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Overview of template user access. Click any widget to jump to user management.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => (
          <Link key={widget.label} href={widget.href}>
            <article className="group relative overflow-hidden rounded-xl border border-neutral-200/60 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10 dark:border-neutral-800/60 dark:bg-neutral-900">
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${widget.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{widget.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">{widget.value}</p>
                </div>
                <widget.icon className="h-5 w-5 text-violet-500" />
              </div>
              <p className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-300">
                View details
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </p>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
