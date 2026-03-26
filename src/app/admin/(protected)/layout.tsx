import { AdminShell } from "@/features/admin/components/admin-shell";
import { TokenStorageSync } from "@/features/auth/components/token-storage-sync";
import { requireAuth } from "@/lib/auth/session";
import { SessionProvider } from "next-auth/react";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <TokenStorageSync />
      <AdminShell
        userName={session.user.name ?? session.user.email ?? "User"}
        roleLevel={session.user.roleLevel}
      >
        {children}
      </AdminShell>
    </SessionProvider>
  );
}
