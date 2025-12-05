import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, TrendingUp, Plus, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useSwipeNavigation, SWIPEABLE_ROUTES } from "@/layouts/SwipeableLayout";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  index?: number; // Optional - Create doesn't have an index
  isAction?: boolean;
}

// Navigation items - Create is separate (modal), others are swipeable
const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard", index: 0 },
  { id: "habits", label: "Hábitos", icon: ListChecks, path: "/habits", index: 1 },
  { id: "create", label: "Criar", icon: Plus, path: "/create", isAction: true },
  { id: "progress", label: "Streaks", icon: TrendingUp, path: "/progress", index: 2 },
  { id: "profile", label: "Perfil", icon: User, path: "/profile", index: 3 },
];

const transition = { type: "spring", bounce: 0.2, duration: 0.35 } as const;

const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentIndex, navigateTo, isSwipeable } = useSwipeNavigation();

  const handleNavigate = (item: NavItem) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(8);
    }

    // Create is a modal - use regular navigation
    if (item.isAction) {
      navigate(item.path);
      return;
    }

    // Swipeable routes - use carousel navigation
    if (item.index !== undefined) {
      navigateTo(item.index);
    }
  };

  // Determine active item - use swipe index if on swipeable route, otherwise match by path
  const getActiveIndex = () => {
    if (isSwipeable) {
      return currentIndex;
    }
    // For non-swipeable routes, find matching path
    const route = SWIPEABLE_ROUTES.find(r => r.path === location.pathname);
    return route?.index ?? -1;
  };

  const activeIndex = getActiveIndex();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "pt-1"
      )}
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))'
      }}
      role="navigation"
      aria-label="Navegação principal"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "flex items-center justify-around gap-1.5 px-4 py-2 rounded-t-2xl",
          // Light mode: white bg with top border
          "bg-card/95 border-t border-border",
          // Dark mode: dark bg with subtle border
          "dark:bg-[#0f0f0f]/95 dark:border dark:border-white/[0.08]",
          // Shadows
          "shadow-[0_-2px_10px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]",
          "backdrop-blur-xl"
        )}
      >
        {navItems.map((item) => {
          const isActive = item.index !== undefined && activeIndex === item.index;
          const Icon = item.icon;

          // Special styling for action button (Create)
          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item)}
                aria-label={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  "relative flex items-center justify-center",
                  "w-14 h-14 -mt-4 rounded-full",
                  "bg-primary",
                  "shadow-lg shadow-primary/30",
                  "transition-shadow duration-200",
                  "hover:shadow-xl hover:shadow-primary/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <Icon
                  size={26}
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
              onClick={() => handleNavigate(item)}
              transition={transition}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center rounded-full w-12 h-12",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : cn(
                      // Light mode: gray icons
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      // Dark mode: lighter gray icons
                      "dark:text-white/40 dark:hover:text-white/80 dark:hover:bg-white/5"
                    )
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.6 : 2.2}
                className="flex-shrink-0"
              />
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default NavigationBar;
