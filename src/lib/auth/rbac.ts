import { prisma } from "@/lib/prisma";
import { getFallbackRoleLevel } from "@/lib/auth/roles";

export async function getRoleLevel(roleKey: string) {
  const role = await prisma.role.findUnique({
    where: { key: roleKey },
    select: { level: true, deletedAt: true },
  });

  if (role && !role.deletedAt) {
    return role.level;
  }

  return getFallbackRoleLevel(roleKey);
}

export async function hasMinimumRole(currentRoleKey: string, minimumRoleKey: string) {
  const [currentLevel, minimumLevel] = await Promise.all([
    getRoleLevel(currentRoleKey),
    getRoleLevel(minimumRoleKey),
  ]);

  return currentLevel >= minimumLevel;
}
