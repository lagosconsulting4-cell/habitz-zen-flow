import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useHabits, Habit } from "@/hooks/useHabits";
import { Loader2, MoreVertical, Check, Copy, Edit, Trash2, Sparkles } from "lucide-react";

const emojis = ["??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??", "??"];
const categories = [
  { id: "mente", label: "Mente" },
  { id: "corpo", label: "Corpo" },
  { id: "estudo", label: "Estudo" },
  { id: "carreira", label: "Carreira" },
  { id: "relacionamento", label: "Relacionamento" },
  { id: "financeiro", label: "Financeiro" },
  { id: "outro", label: "Outro" },
];
const periods = [
  { id: "morning", label: "Manhã" },
  { id: "afternoon", label: "Tarde" },
  { id: "evening", label: "Noite" },
];
const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

interface HabitFormState {
  name: string;
  emoji: string;
  category: string;
  period: "morning" | "afternoon" | "evening";
  days_of_week: number[];
}

const createFormState = (habit?: Habit): HabitFormState => ({
  name: habit?.name ?? "",
  emoji: habit?.emoji ?? "??",
  category: habit?.category ?? "mente",
  period: habit?.period ?? "morning",
  days_of_week: habit?.days_of_week ? [...habit.days_of_week] : [1, 2, 3, 4, 5],
});

const MyHabits = () => {
  const { toast } = useToast();
  const {
    habits,
    loading,
    toggleHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    duplicateHabit,
  } = useHabits();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(createFormState());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const filteredHabits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return habits
      .filter((habit) => (status === "active" ? habit.is_active : !habit.is_active))
      .filter((habit) => (term ? habit.name.toLowerCase().includes(term) : true))
      .filter((habit) =>
        selectedCategories.length > 0 ? selectedCategories.includes(habit.category) : true,
      )
      .filter((habit) =>
        selectedPeriods.length > 0 ? selectedPeriods.includes(habit.period) : true,
      );
  }, [habits, status, searchTerm, selectedCategories, selectedPeriods]);

  const uniqueCategories = useMemo(
    () => Array.from(new Set(habits.map((habit) => habit.category))),
    [habits],
  );

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormState(createFormState(habit));
    setEditSheetOpen(true);
  };

  const handleToggleDay = (day: number) => {
    setFormState((prev) => {
      const includes = prev.days_of_week.includes(day);
      const next = includes
        ? prev.days_of_week.filter((value) => value !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: next.sort((a, b) => a - b) };
    });
  };

  const handleSave = async () => {
    if (!editingHabit) return;
    if (!formState.name.trim()) {
      toast({
        title: "Informe um nome",
        description: "O hábito precisa de um título",
        variant: "destructive",
      });
      return;
    }
    if (formState.days_of_week.length === 0) {
      toast({
        title: "Selecione dias",
        description: "Escolha ao menos um dia da semana",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateHabit(editingHabit.id, {
        name: formState.name.trim(),
        emoji: formState.emoji,
        category: formState.category,
        period: formState.period,
        days_of_week: formState.days_of_week,
      });
      toast({ title: "Hábito atualizado" });
      setEditSheetOpen(false);
      setEditingHabit(null);
    } catch (error) {
      // handled in hook toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (habit: Habit) => {
    if (!habit.is_active) return;
    try {
      await toggleHabit(habit.id);
      toast({ title: "Dia marcado" });
    } catch (error) {
      // toast handled no need
    }
  };

  const handleDuplicate = async (habit: Habit) => {
    try {
      await duplicateHabit(habit.id);
    } catch (error) {
      /* handled */
    }
  };

  const handleArchiveToggle = async (habit: Habit) => {
    try {
      if (habit.is_active) {
        await archiveHabit(habit.id);
      } else {
        await restoreHabit(habit.id);
      }
    } catch (error) {
      /* handled */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHabit(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      /* handled */
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-light mb-1">
              Meus <span className="font-medium gradient-text">Hábitos</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus hábitos, agenda semanal e conclua tarefas do dia.
            </p>
          </div>
          <Button asChild>
            <Link to="/create">Adicionar novo hábito</Link>
          </Button>
        </div>

        <Card className="glass-card p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Buscar hábito"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="md:max-w-sm"
            />
            <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <TabsList>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="archived">Arquivados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {uniqueCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(category)
                      ? prev.filter((item) => item !== category)
                      : [...prev, category],
                  )
                }
              >
                {categories.find((item) => item.id === category)?.label ?? category}
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {periods.map((period) => (
              <Badge
                key={period.id}
                variant={selectedPeriods.includes(period.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  setSelectedPeriods((prev) =>
                    prev.includes(period.id)
                      ? prev.filter((item) => item !== period.id)
                      : [...prev, period.id],
                  )
                }
              >
                {period.label}
              </Badge>
            ))}
          </div>
        </Card>

        {loading ? (
          <Card className="glass-card p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : filteredHabits.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <h2 className="text-lg font-medium mb-2">Nenhum hábito encontrado</h2>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros ou cadastre um novo hábito para começar.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHabits.map((habit) => (
              <Card key={habit.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{habit.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{habit.name}</h3>
                        {!habit.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Arquivado
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{categories.find((item) => item.id === habit.category)?.label ?? habit.category}</Badge>
                        <Badge variant="outline">
                          {periods.find((period) => period.id === habit.period)?.label ?? habit.period}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-orange-500" />
                          <span>{habit.streak} dias de sequência</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {weekdayLabels.map((label, index) => {
                          const active = habit.days_of_week.includes(index);
                          return (
                            <span
                              key={`${habit.id}-${label}`}
                              className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                                active
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onSelect={() => handleEdit(habit)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDuplicate(habit)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleToggle(habit)} disabled={!habit.is_active}>
                        <Check className="mr-2 h-4 w-4" /> Concluir hoje
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleArchiveToggle(habit)}>
                        {habit.is_active ? "Arquivar" : "Reativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setDeleteTarget(habit)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="flex flex-col gap-6 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Editar hábito</SheetTitle>
            <SheetDescription>Atualize o nome, emoji, categoria, período e agenda.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex: Meditar 10 minutos"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Emoji</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant={formState.emoji === emoji ? "default" : "outline"}
                      className="h-10"
                      onClick={() => setFormState((prev) => ({ ...prev, emoji }))}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={formState.category === category.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFormState((prev) => ({ ...prev, category: category.id }))}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <div className="flex gap-2">
                  {periods.map((period) => (
                    <Button
                      key={period.id}
                      type="button"
                      variant={formState.period === period.id ? "default" : "outline"}
                      onClick={() => setFormState((prev) => ({ ...prev, period: period.id as HabitFormState["period"] }))}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dias da semana</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {weekdayLabels.map((label, index) => {
                    const active = formState.days_of_week.includes(index);
                    return (
                      <Toggle
                        key={label}
                        pressed={active}
                        onPressedChange={() => handleToggleDay(index)}
                        className={active ? "bg-primary/20 text-primary" : "bg-muted/40"}
                      >
                        {label}
                      </Toggle>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="flex justify-between gap-3">
            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar alterações
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir hábito?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Remove o hábito e suas conclusões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyHabits;
