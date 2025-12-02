import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface DaySelectorProps {
  selectedDay: number;
  onDayChange: (day: number) => void;
  habitCountByDay?: Record<number, number>;
}

// Ordem: Segunda a Domingo (valores do Date: 1-6, 0)
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];

const DAY_LABELS: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export const DaySelector = ({
  selectedDay,
  onDayChange,
  habitCountByDay,
}: DaySelectorProps) => {
  return (
    <div className="flex justify-between gap-1.5 px-1 py-2 overflow-x-auto scrollbar-hide">
      {DAYS_ORDER.map((day, index) => {
        const isSelected = selectedDay === day;
        const habitCount = habitCountByDay?.[day] || 0;

        return (
          <motion.button
            key={day}
            onClick={() => onDayChange(day)}
            className={cn(
              "flex-1 min-w-[44px] h-[52px] rounded-xl flex flex-col items-center justify-center",
              "transition-all duration-200 touch-manipulation",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-muted/60 hover:bg-muted text-muted-foreground"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span
              className={cn(
                "text-xs font-bold transition-all",
                isSelected && "text-primary-foreground"
              )}
            >
              {DAY_LABELS[day]}
            </span>
            {habitCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "text-[10px] font-medium mt-0.5 leading-none",
                  isSelected
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground/60"
                )}
              >
                {habitCount}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export { DAY_LABELS };
