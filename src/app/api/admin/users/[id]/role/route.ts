import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { normalizeRoleKey } from "@/lib/auth/roles";

const updateRoleSchema = z.object({
  role: z.string().min(2),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasMinimumRole(session.user.role, "ADMIN"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = updateRoleSchema.parse(await request.json());
    const roleKey = normalizeRoleKey(body.role);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, deletedAt: true },
    });

    if (!targetUser || targetUser.deletedAt) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const existingRole = await prisma.role.findFirst({
      where: { key: roleKey, deletedAt: null },
      select: { key: true },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Selected role is not available." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id },
      data: { role: roleKey },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
