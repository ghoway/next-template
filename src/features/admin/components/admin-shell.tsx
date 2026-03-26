"use client";

import Link from "next/link";
import { Loader2, LogOut, Menu, Terminal, X } from "lucide-react";
import NextTopLoader from "nextjs-toploader";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { adminNavigation } from "@/features/admin/data/navigation";
import { hasMinimumRoleLevel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Modal } from "@/components/ui/modal";
import { AdminToastProvider } from "@/features/admin/components/admin-toast";

type AdminShellProps = {
  children: React.ReactNode;
  userName: string;
  roleLevel: number;
};

export function AdminShell({ children, userName, roleLevel }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const visibleLinks = useMemo(
    () =>
      adminNavigation.filter((item) => hasMinimumRoleLevel(roleLevel, item.minimumRole)),
    [roleLevel],
  );

  async function handleSignOut() {
    if (signOutLoading) return;
    setSignOutLoading(true);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth_tokens");
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NextTopLoader
        color="#7c3aed"
        height={3}
        showSpinner={false}
        easing="ease"
        speed={250}
        shadow="0 0 10px #7c3aed,0 0 5px #7c3aed"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh w-64 flex-col overflow-y-auto border-r border-neutral-200/60 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 md:self-start dark:border-neutral-800/60 dark:bg-neutral-950",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200/60 px-4 dark:border-neutral-800/60">
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent"
          >
            <Terminal className="h-5 w-5 text-violet-600" />
            Admin
          </Link>
          <button
            className="rounded p-2 md:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {visibleLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-neutral-200/60 p-4 dark:border-neutral-800/60">
          <Link
            href="/"
            className="mb-3 block text-center text-xs text-neutral-400 transition-colors hover:text-violet-500"
          >
            ← View Public Site
          </Link>
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-950/80 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded p-2 md:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-4 w-4" />
            </button>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Welcome, <span className="font-semibold">{userName}</span>
            </p>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <AdminToastProvider>{children}</AdminToastProvider>
        </main>
      </div>

      <Modal
        open={confirmSignOut}
        onClose={() => (signOutLoading ? null : setConfirmSignOut(false))}
        title="Sign out"
        description="Do you want to sign out from this session?"
        icon={<LogOut className="h-5 w-5" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmSignOut(false)}
              disabled={signOutLoading}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {signOutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Sign Out
            </button>
          </>
        }
      />
    </div>
  );
}
