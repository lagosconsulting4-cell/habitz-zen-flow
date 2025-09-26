import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Book,
  Calendar,
  Headphones,
  Home,
  Lightbulb,
  Map,
  Plus,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  navItems,
  primaryNavItems,
  secondaryNavItems,
  type NavItem,
} from "@/config/nav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
};

interface MoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MoreMenu = ({ open, onOpenChange }: MoreMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const itemsByGroup = useMemo(() => {
    const primary = primaryNavItems.filter((item) => item.id !== "create");
    const secondary = secondaryNavItems;
    return { primary, secondary };
  }, []);

  const handleSelect = (item: NavItem) => {
    onOpenChange(false);
    if (location.pathname !== item.path) {
      navigate(item.path);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] max-h-[520px] rounded-t-3xl border-border/60 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="text-left">
          <SheetTitle>Navegacao rapida</SheetTitle>
          <SheetDescription>
            Acesse rapidamente qualquer pagina do Habitz
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <Command>
            <CommandInput placeholder="Buscar paginas..." />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>

              <CommandGroup heading="Principais">
                {itemsByGroup.primary.map((item) => {
                  const Icon = iconMap[item.icon] ?? Home;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.path}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              <CommandGroup heading="Conteudo extra">
                {itemsByGroup.secondary.map((item) => {
                  const Icon = iconMap[item.icon] ?? Home;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.path}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              <CommandGroup heading="Atalhos">
                {navItems
                  .filter((item) => item.id === "create")
                  .map((item) => {
                    const Icon = iconMap[item.icon] ?? Plus;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.label} ${item.path}`}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MoreMenu;
