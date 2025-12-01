export type NavItemVariant = "primary" | "secondary";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  variant: NavItemVariant;
  requiresAuth?: boolean;
  showInMobileNav?: boolean;
  includeInMoreMenu?: boolean;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Home", path: "/dashboard", icon: "home", variant: "primary", requiresAuth: true, includeInMoreMenu: true },
  { id: "progress", label: "Streaks", path: "/progress", icon: "trending-up", variant: "primary", requiresAuth: true },
  { id: "create", label: "Adicionar", path: "/create", icon: "plus", variant: "primary", requiresAuth: true },
  {
    id: "my-habits",
    label: "Hábitos",
    path: "/habits",
    icon: "list-checks",
    variant: "secondary",
    requiresAuth: true,
    showInMobileNav: true,
    includeInMoreMenu: true,
  },
  { id: "profile", label: "Perfil", path: "/profile", icon: "user", variant: "secondary", requiresAuth: true, showInMobileNav: false, includeInMoreMenu: true },
  { id: "bonus", label: "Bônus", path: "/bonus", icon: "gift", variant: "secondary", requiresAuth: true, showInMobileNav: false, includeInMoreMenu: true }
];

export const primaryNavItems = navItems.filter((item) => item.variant === "primary");
export const secondaryNavItems = navItems.filter((item) => item.variant === "secondary");
