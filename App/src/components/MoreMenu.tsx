import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  Headphones,
  Home,
  Lightbulb,
  ListChecks,
  Map,
  TrendingUp,
  User,
  BookOpen,
  Calendar,
  Gift,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  navItems,
  primaryNavItems,
  type NavItem,
} from "@/config/nav";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  book: Book,
  headphones: Headphones,
  lightbulb: Lightbulb,
  map: Map,
  "list-checks": ListChecks,
  user: User,
  "trending-up": TrendingUp,
  "book-open": BookOpen,
  calendar: Calendar,
  gift: Gift,
};

interface MoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MoreMenu = ({ open, onOpenChange }: MoreMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = useMemo<NavItem[]>(() => {
    const primaryIds = new Set(primaryNavItems.map((item) => item.id));
    const list = navItems.filter((item) => item.includeInMoreMenu || !primaryIds.has(item.id));
    const priority = ["bonus", "my-habits", "profile", "dashboard", "progress"];
    return list.sort((a, b) => (priority.indexOf(a.id) - priority.indexOf(b.id)));
  }, []);

  const handleSelect = (item: NavItem) => {
    onOpenChange(false);
    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[68vh] max-h-[460px] rounded-t-3xl border border-border/70 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.08),transparent_40%),rgba(15,23,42,0.94)] text-foreground shadow-2xl backdrop-blur-2xl dark:bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.1),transparent_45%),rgba(10,12,20,0.96)]"
      >
        <SheetHeader className="text-left space-y-1.5">
          <SheetTitle className="text-lg font-semibold">Mais secoes</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground/90">
            Escolha outra parte do Habitz para explorar.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100%-96px)] pr-3">
          <div className="grid gap-3">
            {items.map((item) => {
              const Icon = iconMap[item.icon] ?? Home;
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-left text-foreground transition-all duration-200 shadow-sm",
                    "hover:border-primary/50 hover:bg-primary/5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(163,230,53,0.25)]" : ""
                  )}
                  onClick={() => handleSelect(item)}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors duration-200",
                        "group-hover:bg-primary/15 group-hover:text-primary",
                        isActive ? "bg-primary/15 text-primary" : ""
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground/90">
                    {item.path.replace("/", "") || "dashboard"}
                  </span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MoreMenu;
