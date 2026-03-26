import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";

const updateRoleSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(240).optional().or(z.literal("")),
  level: z.number().int().min(1).max(1000),
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

    const role = await prisma.role.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!role || role.deletedAt) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        level: body.level,
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        level: true,
        isSystem: true,
      },
    });

    return NextResponse.json({ role: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasMinimumRole(session.user.role, "ADMIN"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;

    const role = await prisma.role.findUnique({
      where: { id },
      select: { id: true, key: true, isSystem: true, deletedAt: true },
    });

    if (!role || role.deletedAt) {
      return NextResponse.json({ error: "Role not found." }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: "System roles cannot be removed." },
        { status: 400 },
      );
    }

    const usersUsingRole = await prisma.user.count({
      where: { role: role.key, deletedAt: null },
    });

    if (usersUsingRole > 0) {
      return NextResponse.json(
        { error: "Role is still assigned to active users." },
        { status: 409 },
      );
    }

    await prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove role." }, { status: 400 });
  }
}
