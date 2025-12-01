import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardHabitCard, type Habit } from "@/components/DashboardHabitCard";

// Mock habits for testing
const mockHabits: (Habit & { completed: boolean })[] = [
  {
    id: "1",
    name: "Parar com POD (COMPLICADO)",
    emoji: "",
    icon_key: "target",
    category: "wellness",
    streak: 1,
    is_favorite: false,
    goal_value: null,
    unit: null,
    completed: false,
  },
  {
    id: "2",
    name: "Acordar Cedo",
    emoji: "",
    icon_key: "list-todo",
    category: "productivity",
    streak: 1,
    is_favorite: false,
    goal_value: null,
    unit: null,
    completed: true,
  },
  {
    id: "3",
    name: "Pomodoro de Trabalho",
    emoji: "",
    icon_key: "clock",
    category: "productivity",
    streak: 2,
    is_favorite: false,
    goal_value: 8,
    unit: "custom",
    completed: true,
  },
  {
    id: "4",
    name: "Acordar Cedo",
    emoji: "",
    icon_key: "list-todo",
    category: "productivity",
    streak: 1,
    is_favorite: false,
    goal_value: null,
    unit: null,
    completed: false,
  },
];

const Preview = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState(mockHabits);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const calculateProgress = (habit: typeof mockHabits[0]): number => {
    if (habit.completed) return 100;
    // Simulate partial progress
    if (habit.id === "1") return 20;
    if (habit.id === "4") return 10;
    return 0;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 px-4 pt-6 pb-32"
      >
        {/* Grid de hábitos - 2 colunas */}
        <div className="grid grid-cols-2 gap-3">
          {habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DashboardHabitCard
                habit={habit}
                progress={calculateProgress(habit)}
                completed={habit.completed}
                onToggle={() => toggleHabit(habit.id)}
                streakDays={habit.streak}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Button - CRIAR ROTINA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-10"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#1a1a1a] border border-lime-400/30 shadow-lg shadow-lime-400/10"
        >
          <Plus size={20} className="text-lime-400" />
          <span className="text-sm font-semibold text-lime-400 tracking-wide">
            CRIAR ROTINA
          </span>
        </motion.button>
      </motion.div>

      {/* Info */}
      <div className="fixed top-4 left-4 text-white/40 text-xs">
        Preview - Novo Design Dashboard
      </div>
    </div>
  );
};

export default Preview;
