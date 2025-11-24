import { useEffect, useMemo, useRef, useState } from "react";
import { CircleEllipsis } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AddHabitCard, CircularHabitCard } from "@/components/CircularHabitCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useHabits } from "@/hooks/useHabits";
import { supabase } from "@/integrations/supabase/client";
import { useAppPreferences } from "@/hooks/useAppPreferences";

type TimerEntry = {
  remaining: number;
  total: number;
  startedAt: number;
  paused?: boolean;
  intervalId?: number;
};

const TIMER_STORAGE_KEY = "habitz:timers";

const Dashboard = () => {
  const { habits, loading, toggleHabit, getHabitCompletionStatus, getHabitsForDate, fetchCompletionsForDate, completions, completionsDate, saveCompletionNote } = useHabits();
  const { prefs } = useAppPreferences();
  const [userName, setUserName] = useState("Habitz");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSyncingDate, setIsSyncingDate] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [notificationTimes, setNotificationTimes] = useState<Map<string, string>>(new Map());
  const [upcoming, setUpcoming] = useState<{ time: string; habit: string }[]>([]);
  const timersRef = useRef<Map<string, TimerEntry>>(new Map());
  const [timerTick, setTimerTick] = useState(0);
  const [noteHabit, setNoteHabit] = useState<{ id: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        if (profile?.display_name) {
          setUserName(profile.display_name);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleCreateHabit = () => {
    navigate("/create");
  };

  const today = useMemo(() => new Date(), []);
  const selectedDateKey = useMemo(
    () => selectedDate.toISOString().split("T")[0],
    [selectedDate]
  );
  const habitsForDate = useMemo(() => getHabitsForDate(selectedDate), [getHabitsForDate, selectedDate]);
  const completedCount = useMemo(
    () => habitsForDate.filter((habit) => getHabitCompletionStatus(habit.id)).length,
    [habitsForDate, getHabitCompletionStatus]
  );
  const todayKey = useMemo(() => today.toISOString().split("T")[0], [today]);
  const isSelectedToday = selectedDateKey === todayKey;

  const completionRate = habitsForDate.length > 0 ? Math.round((completedCount / habitsForDate.length) * 100) : 0;

  const progressByHabit = useMemo(() => {
    if (completionsDate !== selectedDateKey) return new Map<string, number>();
    const map = new Map<string, number>();
    completions.forEach((comp) => {
      if (!comp.habit_id) return;
      const value = comp.value ?? 1;
      map.set(comp.habit_id, Number(value));
    });
    return map;
  }, [completions, completionsDate, selectedDateKey]);

  useEffect(() => {
    const sync = async () => {
      setIsSyncingDate(true);
      try {
        await fetchCompletionsForDate(selectedDateKey);
      } finally {
        setIsSyncingDate(false);
      }
    };
    void sync();
  }, [fetchCompletionsForDate, selectedDateKey]);

  useEffect(() => {
    const loadNotifTimes = async () => {
      if (!isSelectedToday || habitsForDate.length === 0) {
        setNotificationTimes(new Map());
        setUpcoming([]);
        return;
      }
      try {
        const ids = habitsForDate.map((h) => h.id);
        const { data, error } = await supabase
          .from("habit_notifications")
          .select("habit_id,time")
          .in("habit_id", ids);
        if (error) throw error;
        const map = new Map<string, string>();
        const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        const upcomingArr: { time: string; habit: string; minutes: number }[] = [];
        (data ?? []).forEach((row) => {
          if (!row.habit_id || !row.time) return;
          const [h, m] = row.time.split(":").map((n) => Number(n));
          const minutes = h * 60 + m;
          const currentMinutes = parseMinutes(map.get(row.habit_id)) ?? Infinity;
          if (minutes < currentMinutes) {
            map.set(row.habit_id, row.time);
          }
          if (minutes >= nowMinutes) {
            upcomingArr.push({ time: row.time.slice(0, 5), habit: row.habit_id, minutes });
          }
        });
        setNotificationTimes(map);
        setUpcoming(
          upcomingArr
            .sort((a, b) => a.minutes - b.minutes)
            .slice(0, 4)
        );
      } catch (err) {
        console.warn("Falha ao carregar horários de notificação", err);
        setNotificationTimes(new Map());
        setUpcoming([]);
      }
    };
    void loadNotifTimes();
  }, [isSelectedToday, habitsForDate]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((entry) => {
        if (entry.intervalId) clearInterval(entry.intervalId);
      });
      timersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    // Restore timers from storage
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: Record<string, TimerEntry> = JSON.parse(raw);
      const now = Date.now();
      Object.entries(parsed).forEach(([habitId, entry]) => {
        const elapsed = entry.paused ? 0 : Math.floor((now - entry.startedAt) / 1000);
        const remaining = Math.max(0, entry.remaining - elapsed);
        if (remaining > 0) {
          timersRef.current.set(habitId, { ...entry, remaining });
          startTimerInterval(habitId);
        }
      });
      setTimerTick((t) => t + 1);
    } catch (err) {
      console.warn("Failed to restore timers", err);
    }
  }, []);

  const persistTimers = () => {
    const serializable: Record<string, TimerEntry> = {};
    timersRef.current.forEach((value, key) => {
      const { intervalId, ...rest } = value;
      serializable[key] = rest;
    });
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(serializable));
  };

  const parseHour = (value?: string | null) => {
    if (!value) return undefined;
    const match = /^(\d{2}):(\d{2})/.exec(value);
    if (!match) return undefined;
    const hour = Number(match[1]);
    if (Number.isNaN(hour)) return undefined;
    return Math.min(Math.max(hour, 0), 23);
  };
  const parseMinutes = (value?: string | null) => {
    if (!value) return undefined;
    const match = /^(\d{2}):(\d{2})/.exec(value);
    if (!match) return undefined;
    const hour = Number(match[1]);
    const min = Number(match[2]);
    if (Number.isNaN(hour) || Number.isNaN(min)) return undefined;
    return hour * 60 + min;
  };

  const formatShortTime = (value?: string | null) => {
    if (!value) return undefined;
    const parts = value.split(":");
    if (parts.length < 2) return undefined;
    const [h, m] = parts;
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const startTimerInterval = (habitId: string) => {
    const entry = timersRef.current.get(habitId);
    if (!entry) return;
    if (entry.intervalId) clearInterval(entry.intervalId);
    const id = window.setInterval(async () => {
      const current = timersRef.current.get(habitId);
      if (!current) {
        clearInterval(id);
        return;
      }
      if (current.paused) return;
      const next = current.remaining - 1;
      if (next <= 0) {
        clearInterval(id);
        timersRef.current.delete(habitId);
        persistTimers();
        setTimerTick((t) => t + 1);
        await toggleHabit(habitId, selectedDateKey);
        return;
      }
      timersRef.current.set(habitId, { ...current, remaining: next, intervalId: id });
      persistTimers();
      setTimerTick((t) => t + 1);
    }, 1000);
    timersRef.current.set(habitId, { ...entry, intervalId: id, paused: false });
  };

  const startTimer = (habit: (typeof habitsForDate)[number]) => {
    if (habit.unit !== "minutes" || !habit.goal_value || habit.goal_value <= 0) return;
    if (timersRef.current.has(habit.id)) {
      // retomar se estava pausado
      timersRef.current.set(habit.id, { ...timersRef.current.get(habit.id)!, paused: false, startedAt: Date.now() });
      startTimerInterval(habit.id);
      setTimerTick((t) => t + 1);
      persistTimers();
      return;
    }
    const totalSeconds = Math.max(60, Math.round(Number(habit.goal_value) * 60));
    timersRef.current.set(habit.id, {
      remaining: totalSeconds,
      total: totalSeconds,
      startedAt: Date.now(),
      paused: false,
    });
    startTimerInterval(habit.id);
    setTimerTick((t) => t + 1);
    persistTimers();
  };

  const stopTimer = (habitId: string) => {
    const entry = timersRef.current.get(habitId);
    if (entry) {
      if (entry.intervalId) clearInterval(entry.intervalId);
      timersRef.current.delete(habitId);
      setTimerTick((t) => t + 1);
      persistTimers();
    }
  };

  const pauseTimer = (habitId: string) => {
    const entry = timersRef.current.get(habitId);
    if (entry) {
      timersRef.current.set(habitId, { ...entry, paused: true });
      persistTimers();
      setTimerTick((t) => t + 1);
    }
  };

  const withPendingFlag = useMemo(() => {
    const nowHour = new Date().getHours();
    const periodTarget: Record<string, number> = { morning: 11, afternoon: 17, evening: 22 };

    return habitsForDate.map((h) => {
      const completed = getHabitCompletionStatus(h.id);
      const notifTime = notificationTimes.get(h.id);
      const targetHour =
        parseHour(notifTime) ??
        parseHour((h as any)?.notification_pref?.reminder_time) ??
        periodTarget[h.period] ??
        18;
      const hoursUntil = isSelectedToday ? targetHour - nowHour : 6;
      const timer = timersRef.current.get(h.id);
      const timerRatio = timer ? 1 - timer.remaining / timer.total : 0;
      const ratio =
        h.goal_value && h.goal_value > 0
          ? Math.min(1, Math.max(timerRatio, (progressByHabit.get(h.id) ?? 0) / Number(h.goal_value)))
          : completed
            ? 1
            : timerRatio;

      const minutesUntil =
        parseMinutes(notifTime) !== undefined
          ? (parseMinutes(notifTime) ?? 0) - (new Date().getHours() * 60 + new Date().getMinutes())
          : hoursUntil * 60;

      const considerAlerts = prefs.notificationsEnabled;
      const isOverdue = considerAlerts && isSelectedToday && minutesUntil <= 0 && ratio < 1;
      const dueSoon = considerAlerts && isSelectedToday && minutesUntil > 0 && minutesUntil <= 120 && ratio < 1;
      const lowProgress = ratio < 0.5;
      const shouldFlag = !completed && isSelectedToday && (isOverdue || dueSoon || lowProgress);

      const nextReminderMinutes = parseMinutes(notifTime);

      return { ...h, __pending: shouldFlag, __progressRatio: ratio, __nextReminderMinutes: nextReminderMinutes, __timer: timer };
    });
  }, [habitsForDate, getHabitCompletionStatus, isSelectedToday, progressByHabit, notificationTimes, timerTick]);

  const gridHabits = useMemo(() => {
    const filtered = showCompleted
      ? withPendingFlag
      : withPendingFlag.filter((h) => !getHabitCompletionStatus(h.id));

    return [...filtered].sort((a, b) => {
      const aDone = getHabitCompletionStatus(a.id) ? 1 : 0;
      const bDone = getHabitCompletionStatus(b.id) ? 1 : 0;

      if (a.__pending !== b.__pending) {
        return a.__pending ? -1 : 1;
      }

      const aReminder = (a as any).__nextReminderMinutes ?? Infinity;
      const bReminder = (b as any).__nextReminderMinutes ?? Infinity;
      if (aReminder !== bReminder) {
        return aReminder - bReminder;
      }

      const aProgress = (a as any).__progressRatio ?? (aDone ? 1 : 0);
      const bProgress = (b as any).__progressRatio ?? (bDone ? 1 : 0);

      if (prefs.gridOrder === "streak") {
        return b.streak - a.streak || bProgress - aProgress;
      }

      if (aDone !== bDone) {
        return aDone - bDone;
      }

      if (aProgress !== bProgress) {
        return aProgress - bProgress;
      }

      return b.streak - a.streak;
    });
  }, [withPendingFlag, showCompleted, getHabitCompletionStatus, prefs.gridOrder]);

  const dayOptions = useMemo(() => {
    const options: { label: string; date: Date }[] = [];
    for (let i = 0; i < 5; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      options.push({
        label: isToday ? "Hoje" : isTomorrow ? "Amanhã" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
        date: d,
      });
    }
    return options;
  }, [today]);

  const notesForDate = useMemo(() => {
    if (completionsDate !== selectedDateKey) return [];
    return completions
      .filter((c) => (c.note ?? "").trim().length > 0)
      .map((c) => {
        const habit = habits.find((h) => h.id === c.habit_id);
        return {
          habitId: c.habit_id,
          habitName: habit?.name ?? "Hábito",
          note: (c.note ?? "").trim(),
          time: c.completed_at_time ?? null,
        };
      })
      .sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return a.time.localeCompare(b.time);
      });
  }, [completions, completionsDate, habits, selectedDateKey]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Hoje</p>
              <h1 className="text-3xl font-semibold leading-tight">
                Proteja sua <span className="gradient-text">sequência</span>, {userName}.
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <div className="mt-2 inline-flex flex-col items-center rounded-2xl bg-card px-3 py-2 text-[11px] shadow-[var(--shadow-soft)]">
                <span className="text-sm font-semibold text-foreground">
                  {completedCount}/{habitsForDate.length}
                </span>
                <span className="text-muted-foreground">no dia</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start">
              <Button variant="outline" className="rounded-full border border-border/70 bg-card px-4" onClick={() => navigate("/progress")}>
                <CircleEllipsis className="mr-2 h-4 w-4" />
                Métricas
              </Button>
              <Button className="rounded-full px-4" onClick={handleCreateHabit}>
                Criar hábito
              </Button>
            </div>
          </header>

          <Card className="mb-4 rounded-2xl border border-border/60 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de sucesso</p>
                <p className="text-3xl font-semibold">{completionRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Melhor streak</p>
                <p className="text-xl font-semibold">
                  {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0}d
                </p>
              </div>
            </div>
          </Card>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            {dayOptions.map((option) => {
              const key = option.date.toISOString().split("T")[0];
              const isActive = selectedDateKey === key;
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full px-3"
                  onClick={() => setSelectedDate(option.date)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              id="hide-completed"
              type="checkbox"
              checked={!showCompleted}
              onChange={(e) => setShowCompleted(!e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="hide-completed" className="text-sm text-muted-foreground">
              Ocultar concluídos
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <Card className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-soft)]">
              {isSyncingDate && (
                <p className="mb-3 text-xs text-muted-foreground">Sincronizando conclusão do dia...</p>
              )}
              {gridHabits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum hábito programado para este dia.</p>
                  <Button variant="link" onClick={handleCreateHabit} className="mt-2">Adicionar hábito</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <AddHabitCard onClick={handleCreateHabit} label="Add task" />
                  {gridHabits.map((habit) => {
                    const timer = (habit as any).__timer as { remaining: number; total: number } | undefined;
                    const timerRunning = Boolean(timer);
                    const remainingLabel = timer
                      ? `${String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:${String(Math.floor(timer.remaining % 60)).padStart(2, "0")}`
                      : "";
                    const progressOverride =
                      habit.goal_value && habit.goal_value > 0
                        ? Math.min(
                            1,
                            Math.max(
                              (habit as any).__progressRatio ?? 0,
                              timer ? 1 - timer.remaining / timer.total : 0
                            )
                          )
                        : (habit as any).__progressRatio;

                    const wasCompleted = getHabitCompletionStatus(habit.id);

                    return (
                      <div key={habit.id} className="flex flex-col items-center gap-2">
                        <CircularHabitCard
                          id={habit.id}
                          name={habit.name}
                          emoji={habit.emoji}
                          icon_key={habit.icon_key}
                          color={habit.color ?? undefined}
                          streak={habit.streak}
                          category={habit.category}
                          autoCompleteSource={habit.auto_complete_source ?? undefined}
                          progress={progressOverride}
                          completed={wasCompleted}
                          isPending={Boolean((habit as any).__pending)}
                          onClick={async () => {
                            const before = getHabitCompletionStatus(habit.id);
                            await toggleHabit(habit.id, selectedDateKey);
                            if (!before) {
                              setNoteHabit({ id: habit.id, name: habit.name });
                              setNoteText("");
                            }
                          }}
                        />
                        {habit.unit === "minutes" && habit.goal_value ? (
                          <Button
                            size="sm"
                            variant={timerRunning ? "outline" : "default"}
                            className="h-8 rounded-full px-3 text-xs"
                            onClick={() => (timerRunning ? pauseTimer(habit.id) : startTimer(habit))}
                          >
                            {timerRunning ? `Pausar ${remainingLabel}` : "Iniciar timer"}
                          </Button>
                        ) : null}
                        {timerRunning && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-full px-3 text-xs"
                            onClick={() => stopTimer(habit.id)}
                          >
                            Encerrar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
          {notesForDate.length > 0 && (
            <Card className="mt-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-soft)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Notas do dia</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{notesForDate.length} nota{notesForDate.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-3">
                {notesForDate.map((item, idx) => (
                  <div
                    key={`${item.habitId}-${item.time ?? idx}`}
                    className="rounded-lg border border-border/60 bg-muted/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.habitName}</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{item.note}</p>
                      </div>
                      {item.time ? (
                        <span className="text-xs text-muted-foreground">
                          {formatShortTime(item.time)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={!!noteHabit}
        onOpenChange={(open) => {
          if (!open) {
            setNoteHabit(null);
            setNoteText("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nota</DialogTitle>
            <DialogDescription>Registre algo rápido sobre o hábito concluído.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Como foi completar este hábito?"
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNoteHabit(null);
                setNoteText("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!noteHabit) return;
                const ok = await saveCompletionNote(noteHabit.id, selectedDateKey, noteText.trim());
                if (ok) {
                  setNoteHabit(null);
                  setNoteText("");
                }
              }}
              disabled={!noteHabit}
            >
              Salvar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
