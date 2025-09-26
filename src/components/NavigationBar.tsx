import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Plus,
  TrendingUp,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { primaryNavItems } from "@/config/nav";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  calendar: Calendar,
  plus: Plus,
  "trending-up": TrendingUp,
};

interface NavigationBarProps {
  onOpenMore?: () => void;
}

const NavigationBar = ({ onOpenMore }: NavigationBarProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { leftItems, rightItems } = useMemo(() => {
    const items = primaryNavItems.filter((item) => item.id !== "create");
    return {
      leftItems: items.slice(0, 2),
      rightItems: items.slice(2),
    };
  }, []);

  const handleNavigate = (path: string) => {
    if (location.pathname === path) {
      return;
    }
    navigate(path);
  };

  const renderNavButton = (itemId: string, label: string, path: string, icon: string) => {
    const Icon = iconMap[icon] ?? Home;
    const isActive = location.pathname === path;

    return (
      <motion.button
        key={itemId}
        type="button"
        onClick={() => handleNavigate(path)}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className="relative flex items-center justify-center rounded-2xl px-1.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative flex flex-col items-center gap-1 rounded-xl px-1.5 py-1.5">
          {isActive && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-xl bg-primary/12 shadow-[0_8px_18px_rgba(34,197,94,0.18)]"
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />
          )}
          <Icon
            className={cn(
              "relative h-3.5 w-3.5 transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "relative text-[10px] font-medium transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        </span>
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-card/90 backdrop-blur-lg safe-area-bottom md:hidden">
      <div className="mx-auto grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center gap-2 px-2.5 py-1.5">
        <div className="flex min-w-0 items-center justify-between gap-1">
          {leftItems.map((item) =>
            renderNavButton(item.id, item.label, item.path, item.icon)
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => handleNavigate("/create")}
          aria-label="Criar habito"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-white shadow-[0_14px_22px_rgba(34,197,94,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="h-5 w-5" />
        </motion.button>

        <div className="flex min-w-0 items-center justify-between gap-1">
          {rightItems.map((item) =>
            renderNavButton(item.id, item.label, item.path, item.icon)
          )}
          <motion.button
            type="button"
            onClick={onOpenMore}
            aria-label="Abrir menu de secoes"
            className="relative flex flex-col items-center justify-center rounded-2xl px-1.5 py-1.5 text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative flex flex-col items-center gap-1">
              <Menu className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium">Mais</span>
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
