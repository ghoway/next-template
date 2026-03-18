import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/roles";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user || session.tokenError === "RefreshTokenExpired") {
    redirect("/admin/login");
  }

  return session;
}

export async function requireRole(minimumRole: Role) {
  const session = await requireAuth();
  const currentRole = session.user.role;

  if (!currentRole || !hasMinimumRole(currentRole, minimumRole)) {
    redirect("/admin");
  }

  return session;
}
