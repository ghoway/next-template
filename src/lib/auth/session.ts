import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";

export async function requireAuth() {
  const session = await auth();

  if (
    !session?.user ||
    session.tokenError === "RefreshTokenExpired" ||
    session.tokenError === "RefreshTokenInvalid"
  ) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireRole(minimumRoleKey: string) {
  const session = await requireAuth();
  const currentRole = session.user.role;

  if (!currentRole || !(await hasMinimumRole(currentRole, minimumRoleKey))) {
    redirect("/admin");
  }

  return session;
}
