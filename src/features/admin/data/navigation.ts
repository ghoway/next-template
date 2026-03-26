import { LayoutDashboard, SquarePen, Users } from "lucide-react";

import { SYSTEM_ROLE_KEYS } from "@/lib/auth/roles";

export const adminNavigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    minimumRole: SYSTEM_ROLE_KEYS.USERS,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    minimumRole: SYSTEM_ROLE_KEYS.ADMIN,
  },
  {
    href: "/admin/blank",
    label: "Blank",
    icon: SquarePen,
    minimumRole: SYSTEM_ROLE_KEYS.USERS,
  },
] as const;
