export type NavItemVariant = "primary" | "secondary";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  variant: NavItemVariant;
  requiresAuth?: boolean;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Inicio", path: "/dashboard", icon: "home", variant: "primary", requiresAuth: true },
  { id: "plano", label: "Meu Plano", path: "/plano", icon: "book-open", variant: "primary", requiresAuth: true },
  { id: "calendar", label: "Calendario", path: "/calendar", icon: "calendar", variant: "primary", requiresAuth: true },
  { id: "create", label: "Criar", path: "/create", icon: "plus", variant: "primary", requiresAuth: true },
  { id: "progress", label: "Progresso", path: "/progress", icon: "trending-up", variant: "primary", requiresAuth: true },
  { id: "profile", label: "Perfil", path: "/profile", icon: "user", variant: "secondary", requiresAuth: true },
  { id: "books", label: "Biblioteca", path: "/books", icon: "book", variant: "secondary", requiresAuth: true },
  { id: "meditation", label: "Meditacao", path: "/meditation", icon: "headphones", variant: "secondary", requiresAuth: true },
  { id: "tips", label: "Insights", path: "/tips", icon: "lightbulb", variant: "secondary", requiresAuth: true },
  { id: "guided", label: "Jornada", path: "/guided", icon: "map", variant: "secondary", requiresAuth: true },
  { id: "quiz", label: "Avaliacao TDAH", path: "/quiz", icon: "brain", variant: "secondary", requiresAuth: true },
  { id: "my-habits", label: "Meus Habitos", path: "/habits", icon: "list-checks", variant: "secondary", requiresAuth: true }
];

export const primaryNavItems = navItems.filter((item) => item.variant === "primary");
export const secondaryNavItems = navItems.filter((item) => item.variant === "secondary");

