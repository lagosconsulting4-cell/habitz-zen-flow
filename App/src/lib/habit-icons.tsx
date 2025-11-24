import {
  Activity,
  Bike,
  Brain,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Heart,
  Soup,
  BookOpen,
  Target,
  PenSquare,
  Moon,
  AlarmClockCheck,
  Coffee,
  Sandwich,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const registry: Record<string, LucideIcon> = {
  heart: Heart,
  run: Activity,
  run2: Activity,
  bike: Bike,
  mediate: Brain,
  meditate: Brain,
  banana: Soup,
  carrot: Soup,
  check: Check,
  water: Droplets,
  dumbbell: Dumbbell,
  focus: Target,
  target: Target,
  book: BookOpen,
  flame: Flame,
  journal: PenSquare,
  sleep: Moon,
  alarm: AlarmClockCheck,
  coffee: Coffee,
  meal: Sandwich,
};

export function getHabitIcon(iconKey?: string | null): LucideIcon | null {
  if (!iconKey) return null;
  return registry[iconKey] ?? null;
}
