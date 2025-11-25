import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, TrendingUp, Plus, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavigationBarProps {
  onOpenMore?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isAction?: boolean;
}

// Navigation items - simplified for bottom nav
const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard" },
  { id: "habits", label: "Hábitos", icon: ListChecks, path: "/habits" },
  { id: "create", label: "Criar", icon: Plus, path: "/create", isAction: true },
  { id: "progress", label: "Streaks", icon: TrendingUp, path: "/progress" },
];

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? "0.375rem" : 0,
    paddingLeft: isSelected ? "0.75rem" : "0.5rem",
    paddingRight: isSelected ? "0.75rem" : "0.5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { type: "spring", bounce: 0.2, duration: 0.35 };

const NavigationBar = ({ onOpenMore }: NavigationBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const getActiveItem = () => {
    const currentPath = location.pathname;
    const item = navItems.find((item) => currentPath === item.path);
    return item?.id || null;
  };

  const activeId = getActiveItem();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 safe-area-bottom md:hidden",
        "px-3 pb-2 pt-1"
      )}
      role="navigation"
      aria-label="Navegação principal"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "mx-auto flex items-center justify-around gap-0.5 p-1.5 rounded-2xl",
          "bg-[#0f0f0f]/95 border border-white/[0.08]",
          "shadow-[0_-4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]",
          "backdrop-blur-xl"
        )}
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          // Special styling for action button (Create)
          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.path)}
                aria-label={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative flex items-center justify-center",
                  "w-12 h-12 -mt-4 rounded-2xl",
                  "bg-gradient-to-br from-lime-400 to-lime-500",
                  "shadow-lg shadow-lime-400/30",
                  "transition-shadow duration-200",
                  "hover:shadow-xl hover:shadow-lime-400/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={2.5}
                  className="text-primary-foreground"
                />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              type="button"
              variants={buttonVariants}
              initial={false}
              animate="animate"
              custom={isActive}
              onClick={() => handleNavigate(item.path)}
              transition={transition}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center py-2.5 rounded-xl",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20 active:bg-muted/30"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className="flex-shrink-0"
              />
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    variants={spanVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    className="overflow-hidden text-xs font-semibold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* More Button */}
        {onOpenMore && (
          <motion.button
            type="button"
            onClick={onOpenMore}
            aria-label="Mais opções"
            className={cn(
              "relative flex items-center justify-center py-2.5 px-3 rounded-xl",
              "transition-colors duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-muted/20 active:bg-muted/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            )}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal size={20} strokeWidth={2} />
          </motion.button>
        )}
      </motion.div>
    </nav>
  );
};

export default NavigationBar;
