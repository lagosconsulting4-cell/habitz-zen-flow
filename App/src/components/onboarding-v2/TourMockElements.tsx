import { Home, ListChecks, TrendingUp, Compass, User, Diamond, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ============================================================================
// MOCK NAVIGATION BAR (replicates NavigationBar.tsx:18-118)
// ============================================================================

interface MockNavItem {
  id: string;
  tourId: string;
  icon: LucideIcon;
}

const MOCK_NAV_ITEMS: MockNavItem[] = [
  { id: "home", tourId: "today", icon: Home },
  { id: "habits", tourId: "habits", icon: ListChecks },
  { id: "journeys", tourId: "journeys", icon: Compass },
  { id: "progress", tourId: "progress", icon: TrendingUp },
  { id: "profile", tourId: "profile", icon: User },
];

interface MockNavigationBarProps {
  activeTab: string; // matches id field: "home" | "habits" | "journeys" | etc.
}

export const MockNavigationBar = ({ activeTab }: MockNavigationBarProps) => (
  <nav
    className={cn("fixed inset-x-0 bottom-0 z-40 md:hidden", "pt-1")}
    aria-hidden="true"
  >
    <div
      className={cn(
        "flex items-center justify-around gap-1.5 px-4 py-2 rounded-t-2xl",
        "bg-card/95 border-t border-border",
        "dark:bg-[#0f0f0f]/95 dark:border dark:border-white/[0.08]",
        "shadow-[0_-2px_10px_rgba(0,0,0,0.06)]",
        "dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]",
        "backdrop-blur-xl"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {MOCK_NAV_ITEMS.map((item) => {
        const isActive = item.id === activeTab;
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            data-tour={item.tourId}
            className={cn(
              "relative flex items-center justify-center rounded-full w-12 h-12",
              "transition-colors duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : cn(
                    "text-muted-foreground",
                    "dark:text-white/40"
                  )
            )}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.6 : 2.2}
              className="flex-shrink-0"
            />
          </div>
        );
      })}
    </div>
  </nav>
);

// ============================================================================
// MOCK PROFILE SECTION (replicates Profile.tsx:163-303 simplified)
// ============================================================================

interface MockProfileSectionProps {
  highlightTarget: "avatar" | "bonus";
}

export const MockProfileSection = ({ highlightTarget }: MockProfileSectionProps) => (
  <div className="px-4 pt-6 max-w-2xl mx-auto w-full">
    {/* Identity Header — replicates Profile.tsx:163-241 */}
    <div className="text-center mb-8">
      <div className="relative">
        <div
          data-tour="avatar"
          className={cn(
            "mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20",
            highlightTarget === "avatar" && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
          )}
        >
          <User className="w-10 h-10 text-primary/60" />
        </div>
      </div>
      <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground mb-1">Seu Nome</h1>
      <p className="text-muted-foreground text-sm">email@exemplo.com</p>
    </div>

    {/* Recursos Card — replicates Profile.tsx:250-303 */}
    <div
      data-tour="bonus"
      className={cn(
        "rounded-2xl bg-card border border-border p-6",
        highlightTarget === "bonus" && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
      )}
    >
      <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Recursos</h2>
      <div className="space-y-3">
        {/* Gems */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Diamond className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Gems</p>
              <p className="text-2xl font-bold text-foreground">50</p>
            </div>
          </div>
        </div>
        {/* Freezes */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-foreground/5 to-foreground/10 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-foreground/10">
              <Snowflake className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Streak Freezes</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
