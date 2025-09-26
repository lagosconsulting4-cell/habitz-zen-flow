import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  Calendar,
  Headphones,
  Home,
  Lightbulb,
  ListChecks,
  Map,
  Plus,
  TrendingUp,
  User,
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
  calendar: Calendar,
  plus: Plus,
  "trending-up": TrendingUp,
  user: User,
  book: Book,
  headphones: Headphones,
  lightbulb: Lightbulb,
  map: Map,
  "list-checks": ListChecks,
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
    return navItems.filter((item) => !primaryIds.has(item.id));
  }, []);

  const handleSelect = (item: NavItem) => {
    onOpenChange(false);
    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] max-h-[480px] rounded-t-3xl border-border/60 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="text-left">
          <SheetTitle>Mais secoes</SheetTitle>
          <SheetDescription>
            Explore conteudos que nao cabem na barra principal.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100%-96px)] pr-4">
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
                    "group flex w-full items-center justify-between rounded-2xl border border-border/50 bg-card/60 px-4 py-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-primary/5",
                    isActive ? "border-primary/60 bg-primary/10" : ""
                  )}
                  onClick={() => handleSelect(item)}
                >
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.path.replace("/", "") || "dashboard"}</span>
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