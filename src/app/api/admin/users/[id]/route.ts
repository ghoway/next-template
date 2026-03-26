import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { normalizeRoleKey } from "@/lib/auth/roles";

const updateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
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
    const body = updateUserSchema.parse(await request.json());
    const roleKey = normalizeRoleKey(body.role);

    const current = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, deletedAt: true },
    });

    if (!current || current.deletedAt) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (body.email !== current.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, deletedAt: true },
      });

      if (existingEmail && !existingEmail.deletedAt) {
        return NextResponse.json(
          { error: "Email is already in use." },
          { status: 409 },
        );
      }
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

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        role: roleKey,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString().slice(0, 10),
      },
    });
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!targetUser || targetUser.deletedAt) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      deletedAt: new Date().toISOString().slice(0, 10),
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete user." }, { status: 400 });
  }
}
