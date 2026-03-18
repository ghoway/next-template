import { hashSync } from "bcryptjs";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = createUserSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, deletedAt: true },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        return NextResponse.json(
          { error: "Email belongs to an archived user and cannot be reused." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Email is already in use." },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        hashedPassword: hashSync(body.password, 12),
        role: body.role,
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
