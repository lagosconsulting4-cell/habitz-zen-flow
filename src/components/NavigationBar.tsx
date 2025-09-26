import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Plus,
  TrendingUp,
  User,
  EllipsisVertical,
  type LucideIcon,
} from "lucide-react";
import { primaryNavItems } from "@/config/nav";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  plus: Plus,
  "trending-up": TrendingUp,
  user: User,
};

interface NavigationBarProps {
  onOpenMore?: () => void;
}

const NavigationBar = ({ onOpenMore }: NavigationBarProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (location.pathname === path) {
      return;
    }
    navigate(path);
  };

  return (
    <div className="fixed md:hidden inset-x-0 bottom-0 z-40 border-t border-border/40 bg-card/80 backdrop-blur-lg safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        {primaryNavItems.map((item) => {
          const Icon = iconMap[item.icon] ?? Home;
          const isActive = location.pathname === item.path;

          if (item.id === "create") {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.path)}
                aria-label="Criar habito"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-medium transition-transform duration-200 hover:translate-y-[-2px] hover:shadow-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.path)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "animate-scale-in" : ""}`} />
              <span className="mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenMore}
          aria-label="Abrir menu mais"
          className="flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs text-muted-foreground transition-all duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <EllipsisVertical className="h-5 w-5" />
          <span className="mt-1 font-medium">Mais</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
