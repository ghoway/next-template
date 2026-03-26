import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { hasMinimumRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";

const updatePasswordSchema = z.object({
  password: z.string().min(6),
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
    const body = updatePasswordSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: {
        hashedPassword: hashSync(body.password, 12),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
