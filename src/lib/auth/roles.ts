export const SYSTEM_ROLE_KEYS = {
  ADMIN: "ADMIN",
  USERS: "USERS",
} as const;

export const DEFAULT_ROLE_KEY = SYSTEM_ROLE_KEYS.USERS;

const fallbackPriorityMap: Record<string, number> = {
  [SYSTEM_ROLE_KEYS.ADMIN]: 100,
  [SYSTEM_ROLE_KEYS.USERS]: 10,
};

export function getFallbackRoleLevel(roleKey: string) {
  return fallbackPriorityMap[roleKey] ?? 0;
}

export function hasMinimumRoleLevel(currentLevel: number, minimumRoleKey: string) {
  return currentLevel >= getFallbackRoleLevel(minimumRoleKey);
}

export function normalizeRoleKey(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "_");
}
