import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { normalizeRoleKey } from "@/lib/auth/roles";

const createRoleSchema = z.object({
  key: z.string().min(2).max(40),
  name: z.string().min(2).max(60),
  description: z.string().max(240).optional().or(z.literal("")),
  level: z.number().int().min(1).max(1000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasMinimumRole(session.user.role, "ADMIN"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roles = await prisma.role.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      level: true,
      isSystem: true,
      createdAt: true,
    },
    orderBy: [{ level: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ roles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasMinimumRole(session.user.role, "ADMIN"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = createRoleSchema.parse(await request.json());
    const roleKey = normalizeRoleKey(body.key);

    const existing = await prisma.role.findUnique({
      where: { key: roleKey },
      select: { id: true, deletedAt: true },
    });

    if (existing && !existing.deletedAt) {
      return NextResponse.json({ error: "Role key already exists." }, { status: 409 });
    }

    const role = existing
      ? await prisma.role.update({
          where: { key: roleKey },
          data: {
            name: body.name,
            description: body.description || null,
            level: body.level,
            deletedAt: null,
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            level: true,
            isSystem: true,
            createdAt: true,
          },
        })
      : await prisma.role.create({
          data: {
            key: roleKey,
            name: body.name,
            description: body.description || null,
            level: body.level,
            isSystem: false,
          },
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            level: true,
            isSystem: true,
            createdAt: true,
          },
        });

    return NextResponse.json({ role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
