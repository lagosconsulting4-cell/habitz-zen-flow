import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SelectionCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "mini" | "icon-only";
  multiselect?: boolean;
}

export const SelectionCard = ({
  title,
  description,
  icon,
  emoji,
  selected = false,
  disabled = false,
  onClick,
  className,
  variant = "default",
  multiselect = false,
}: SelectionCardProps) => {
  const isCompact = variant === "compact";
  const isMini = variant === "mini";
  const isIconOnly = variant === "icon-only";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn("h-full", className)}
    >
      <div
        className={cn(
          "relative cursor-pointer h-full transition-all duration-300 rounded-2xl group",
          "border bg-[#121214]",
          selected
            ? "border-lime-500 bg-lime-500/10 ring-2 ring-lime-500/20 shadow-lg shadow-lime-500/10"
            : "border-white/10 hover:border-lime-500/40 hover:bg-[#1A1A1C] hover:shadow-xl hover:shadow-lime-500/5",
          disabled && "opacity-50 cursor-not-allowed grayscale",
          isIconOnly ? "p-4" : isMini ? "py-3 px-4" : isCompact ? "p-5" : "p-6"
        )}
        onClick={disabled ? undefined : onClick}
      >
        {/* Selection Indicator - Apple Style Checkbox */}
        <motion.div
          className={cn(
            "absolute flex items-center justify-center pointer-events-none transition-all duration-300",
            isMini ? "right-3 top-1/2 -translate-y-1/2" : "top-4 right-4"
          )}
          animate={{
            scale: selected ? 1 : 0.9,
            opacity: selected ? 1 : 0.4
          }}
        >
          <div
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
              isMini ? "w-5 h-5" : "w-6 h-6",
              selected
                ? "bg-lime-500 text-slate-900 shadow-lime-500/40"
                : "bg-white/5 text-transparent border border-white/20"
            )}
          >
            <Check className={cn("text-slate-900", isMini ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={4} />
          </div>
        </motion.div>

        {/* Content Container */}
        <div
          className={cn(
            "flex items-start",
            isMini ? "gap-3" : "gap-5",
            isIconOnly ? "flex-col justify-center text-center items-center h-full gap-3" : "flex-row"
          )}
        >
          {/* Icon/Emoji Container - Glassy & Soft */}
          {(icon || emoji) && (
            <div
              className={cn(
                "flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300",
                isIconOnly
                  ? "w-16 h-16 text-4xl mb-1"
                  : isMini
                    ? "w-10 h-10 text-lg"
                    : isCompact
                      ? "w-12 h-12 text-xl"
                      : "w-14 h-14 text-2xl",
                selected
                  ? "bg-lime-500 text-slate-900 shadow-lg shadow-lime-500/25 rotate-3 scale-110"
                  : "bg-white/5 text-slate-400 group-hover:bg-lime-500/20 group-hover:text-lime-400 group-hover:scale-105"
              )}
            >
              {emoji ? emoji : icon}
            </div>
          )}

          {/* Text Content */}
          <div className={cn("flex-1 min-w-0 flex flex-col justify-center", !isIconOnly && (isCompact ? "min-h-[3rem]" : "min-h-[3.5rem]"))}>
            <h3
              className={cn(
                "font-bold leading-snug transition-colors",
                selected ? "text-white" : "text-slate-200 group-hover:text-lime-400",
                isIconOnly
                  ? "text-sm"
                  : isMini
                    ? "text-sm"
                    : isCompact
                      ? "text-[0.95rem]"
                      : "text-lg"
              )}
            >
              {title}
            </h3>

            {description && !isIconOnly && !isMini && (
              <p className={cn("text-slate-400 mt-1.5 font-medium leading-relaxed", isCompact ? "text-xs" : "text-sm")}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Grid wrapper for selection cards
export const SelectionCardGrid = ({
  children,
  columns = 2,
  mobileColumns,
  gap = 3,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  mobileColumns?: 1 | 2 | 3;
  gap?: 2 | 3 | 4;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid",
        gap === 2 ? "gap-2" : gap === 4 ? "gap-4" : "gap-3",
        // Mobile columns (default: 1 column for better readability)
        mobileColumns === 3 && "grid-cols-3 sm:grid-cols-3",
        mobileColumns === 2 && "grid-cols-2 sm:grid-cols-2",
        mobileColumns === 1 && "grid-cols-1",
        // Desktop columns when no mobileColumns specified
        !mobileColumns && columns === 1 && "grid-cols-1",
        !mobileColumns && columns === 2 && "grid-cols-1 sm:grid-cols-2",
        !mobileColumns && columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};
