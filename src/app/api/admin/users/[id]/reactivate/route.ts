import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasMinimumRole(session.user.role, "ADMIN"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!targetUser || !targetUser.deletedAt) {
      return NextResponse.json({ error: "Archived user not found." }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString().slice(0, 10),
        deletedAt: null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to reactivate user." }, { status: 400 });
  }
}
