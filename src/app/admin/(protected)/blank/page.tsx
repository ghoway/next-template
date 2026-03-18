import { Role } from "@prisma/client";

import { requireRole } from "@/lib/auth/session";

export default async function AdminBlankPage() {
  await requireRole(Role.EDITOR);

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Blank Starter Page</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Copy this page to bootstrap any new admin module quickly.
      </p>

      <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        Suggested starting points:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Add a server page query with Prisma.</li>
          <li>Build a client table/form component in <code>src/features</code>.</li>
          <li>Expose API routes under <code>src/app/api/admin</code> if needed.</li>
        </ul>
      </div>
    </div>
  );
}
