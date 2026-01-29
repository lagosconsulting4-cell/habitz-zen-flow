import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  TrendingUp,
  User,
  Book,
  BookOpen,
  Headphones,
  Lightbulb,
  ListChecks,
  Map,
  Calendar,
  Gift,
  ShieldCheck,
  Contact,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems, type NavItem } from "@/config/nav";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "book-open": BookOpen,
  plus: Plus,
  "trending-up": TrendingUp,
  user: User,
  book: Book,
  headphones: Headphones,
  lightbulb: Lightbulb,
  "list-checks": ListChecks,
  map: Map,
  calendar: Calendar,
  gift: Gift,
};

interface AppSidebarProps {
  onOpenMore: () => void;
}

const AppSidebar = ({ onOpenMore }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { isAdmin } = useAdmin(userId ?? undefined);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

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

  const essentials = navItems.filter((item) => ["dashboard", "progress", "my-habits"].includes(item.id));
  const extras = navItems.filter((item) => !["dashboard", "progress", "my-habits", "create"].includes(item.id));

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 flex-shrink-0 flex-col justify-between rounded-3xl border border-border/40 bg-card/70 p-5 backdrop-blur md:flex">
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Navegacao</h2>
          <nav className="mt-3 space-y-1">
            {essentials.map(renderLink)}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Admin</h3>
            <nav className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  location.pathname === "/admin"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                aria-label="Admin Dashboard"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/leads")}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  location.pathname === "/admin/leads"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                aria-label="Leads"
              >
                <Contact className="h-4 w-4" />
                <span>Leads</span>
              </button>
            </nav>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Conteudo</h3>
          <nav className="mt-2 space-y-1">
            {extras.map(renderLink)}
          </nav>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const create = navItems.find((item) => item.id === "create");
            if (create) handleNavigate(create);
          }}
        >
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
