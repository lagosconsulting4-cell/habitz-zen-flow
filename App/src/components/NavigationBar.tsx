import { memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, TrendingUp, Compass, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useSwipeNavigation, SWIPEABLE_ROUTES } from "@/layouts/SwipeableLayout";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  index?: number; // Swipe index for carousel-based navigation
}

// Navigation items - all are swipeable
const navItems: NavItem[] = [
  { id: "home",     label: "Hoje",      icon: ListChecks, path: "/dashboard", index: 0 },
  { id: "progress", label: "Progresso", icon: TrendingUp, path: "/progress",  index: 1 },
  { id: "journeys", label: "Jornadas",  icon: Compass,    path: "/journeys",  index: 2 },
  { id: "profile",  label: "Perfil",    icon: User,       path: "/profile",   index: 3 },
];

const transition = { type: "spring", stiffness: 400, damping: 30 } as const;

const NavigationBar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentIndex, navigateTo, isSwipeable } = useSwipeNavigation();

  const handleNavigate = (item: NavItem) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(8);
    }

    // Swipeable routes - use carousel navigation
    if (item.index !== undefined) {
      navigateTo(item.index);
    } else {
      // Non-swipeable routes (e.g. Journeys) - regular navigation
      navigate(item.path);
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
      className={cn("fixed inset-x-0 bottom-0 z-40 md:hidden")}
      role="navigation"
      aria-label="Navegação principal"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "flex items-center justify-around px-5 py-3",
          "bg-card/95 border-t border-border",
          "dark:bg-[#0f0f0f]/95 dark:border-t dark:border-white/[0.06]",
          "shadow-[0_-2px_10px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_-4px_32px_rgba(0,0,0,0.6)]",
          "backdrop-blur-xl"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map((item) => {
          const isActive = item.index !== undefined
            ? activeIndex === item.index
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative flex items-center justify-center">
              {/* Breathing glow ring — only for active item */}
              {isActive && (
                <motion.div
                  className="absolute rounded-full bg-primary pointer-events-none"
                  style={{ width: 56, height: 56 }}
                  animate={{
                    boxShadow: [
                      "0 0 18px rgba(163,230,53,0.45), 0 0 36px rgba(163,230,53,0.25)",
                      "0 0 26px rgba(163,230,53,0.65), 0 0 52px rgba(163,230,53,0.35)",
                      "0 0 18px rgba(163,230,53,0.45), 0 0 36px rgba(163,230,53,0.25)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <motion.button
                data-tour={item.id === "home" ? "today" : item.id}
                type="button"
                onClick={() => handleNavigate(item)}
                transition={transition}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-center rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive
                    ? "w-14 h-14 bg-primary text-black"
                    : cn(
                        "w-10 h-10",
                        "text-muted-foreground hover:text-foreground",
                        "dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/5"
                      )
                )}
                whileTap={{ scale: 0.92 }}
              >
                <Icon
                  size={isActive ? 22 : 20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="flex-shrink-0"
                />
              </motion.button>
            </div>
          );
        })}
      </motion.div>
    </nav>
  );
});

NavigationBar.displayName = "NavigationBar";
export default NavigationBar;
