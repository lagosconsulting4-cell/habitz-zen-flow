import { useMemo } from "react";
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
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
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
        className="relative flex items-center justify-center rounded-2xl px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        whileTap={{ scale: 0.94 }}
      >
        <span className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-2">
          {isActive && (
            <motion.span
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-xl bg-primary/12 shadow-[0_8px_18px_rgba(34,197,94,0.18)]"
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />
          )}
          <Icon
            className={cn(
              "relative h-5 w-5 transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "relative text-xs font-medium transition-colors duration-200",
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-card/85 backdrop-blur-lg safe-area-bottom md:hidden">
      <div className="mx-auto grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-2.5">
        <div className="flex items-center justify-evenly gap-2">
          {leftItems.map((item) =>
            renderNavButton(item.id, item.label, item.path, item.icon)
          )}
        </div>

        <motion.button
          type="button"
          onClick={() => handleNavigate("/create")}
          aria-label="Criar habito"
          className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-primary text-white shadow-[0_16px_28px_rgba(34,197,94,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          whileTap={{ scale: 0.92 }}
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        <div className="flex items-center justify-evenly gap-2">
          {rightItems.map((item) =>
            renderNavButton(item.id, item.label, item.path, item.icon)
          )}
          <motion.button
            type="button"
            onClick={onOpenMore}
            aria-label="Abrir menu mais"
            className="relative flex items-center justify-center rounded-2xl px-3 py-2 text-muted-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            whileTap={{ scale: 0.94 }}
          >
            <span className="flex flex-col items-center gap-1">
              <EllipsisVertical className="h-5 w-5" />
              <span className="text-xs font-medium">Mais</span>
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
