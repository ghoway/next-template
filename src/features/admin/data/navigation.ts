import { Role } from "@prisma/client";
import { LayoutDashboard, SquarePen, Users } from "lucide-react";

export const adminNavigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    minimumRole: Role.VIEWER,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    minimumRole: Role.ADMIN,
  },
  {
    href: "/admin/blank",
    label: "Blank",
    icon: SquarePen,
    minimumRole: Role.EDITOR,
  },
] as const;
