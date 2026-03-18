import { Role } from "@prisma/client";

export const roles = [Role.ADMIN, Role.EDITOR, Role.VIEWER] as const;

const priorityMap: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.EDITOR]: 2,
  [Role.VIEWER]: 1,
};

export function hasMinimumRole(current: Role, minimum: Role) {
  return priorityMap[current] >= priorityMap[minimum];
}
