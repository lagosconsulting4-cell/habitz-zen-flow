import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Plus,
  TrendingUp,
  User,
  Book,
  BookOpen,
  Headphones,
  Lightbulb,
  ListChecks,
  Map,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { primaryNavItems, secondaryNavItems, type NavItem } from "@/config/nav";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "book-open": BookOpen,
  calendar: Calendar,
  plus: Plus,
  "trending-up": TrendingUp,
  user: User,
  book: Book,
  headphones: Headphones,
  lightbulb: Lightbulb,
  "list-checks": ListChecks,
  map: Map,
};

interface AppSidebarProps {
  onOpenMore: () => void;
}

const AppSidebar = ({ onOpenMore }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (item: NavItem) => {
    if (location.pathname === item.path) {
      return;
    }
    navigate(item.path);
  };

  const renderLink = (item: NavItem) => {
    const Icon = iconMap[item.icon] ?? Home;
    const isActive = location.pathname === item.path;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        }`}
        aria-label={item.label}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 flex-shrink-0 flex-col justify-between rounded-3xl border border-border/40 bg-card/70 p-5 backdrop-blur md:flex">
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Navegacao</h2>
          <nav className="mt-3 space-y-1">
            {primaryNavItems.filter((item) => item.id !== "create").map(renderLink)}
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Conteudo</h3>
          <nav className="mt-2 space-y-1">
            {secondaryNavItems.map(renderLink)}
          </nav>
        </div>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={() => handleNavigate(primaryNavItems.find((item) => item.id === "create")!)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo habito
        </Button>
        <Button className="w-full" variant="ghost" onClick={onOpenMore}>
          Descobrir mais
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
