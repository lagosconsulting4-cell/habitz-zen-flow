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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <div
        className={cn(
          "relative cursor-pointer transition-all duration-300 rounded-xl",
          "border-2 bg-white",
          selected
            ? "border-[#A3E635] bg-[#A3E635]/5 shadow-md shadow-[#A3E635]/20"
            : "border-slate-200 hover:border-[#A3E635]/50 hover:shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          isIconOnly ? "p-4" : isMini ? "py-3 px-4" : isCompact ? "p-4" : "p-6",
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        {/* Selection Indicator */}
        <motion.div
          className={cn(
            "absolute inset-y-0 flex items-center justify-center",
            isMini ? "right-2" : "right-3"
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: selected ? 1 : multiselect ? 1 : 0,
            opacity: selected ? 1 : multiselect ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.4,
          }}
        >
          <div
            className={cn(
              "rounded-full flex items-center justify-center",
              isMini ? "w-4 h-4" : "w-5 h-5",
              selected
                ? "bg-[#A3E635] text-slate-900"
                : multiselect
                  ? "border-2 border-slate-200"
                  : ""
            )}
          >
            {selected && (
              <Check className={cn(isMini ? "h-2.5 w-2.5" : "h-3 w-3")} strokeWidth={3} />
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div
          className={cn(
            "flex items-center",
            isMini ? "gap-2" : "gap-4",
            isIconOnly ? "flex-col justify-center text-center" : "flex-row"
          )}
        >
          {/* Icon/Emoji */}
          {(icon || emoji) && (
            <motion.div
              className={cn(
                "flex-shrink-0 flex items-center justify-center rounded-xl",
                isIconOnly
                  ? "w-16 h-16 text-4xl"
                  : isMini
                    ? "w-10 h-10 text-xl"
                    : isCompact
                      ? "w-12 h-12 text-2xl"
                      : "w-14 h-14 text-3xl",
                !emoji && (isMini ? "bg-slate-100 p-2" : "bg-slate-100 p-3")
              )}
              animate={{ rotate: selected ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.3 }}
            >
              {emoji ? emoji : icon}
            </motion.div>
          )}

          {/* Text Content */}
          <div className={cn("flex-1 min-w-0", isIconOnly && "w-full")}>
            <h3
              className={cn(
                "font-bold text-slate-900 leading-tight",
                isIconOnly
                  ? "text-sm mt-2"
                  : isMini
                    ? "text-sm leading-tight"
                    : isCompact
                      ? "text-base"
                      : "text-lg"
              )}
            >
              {title}
            </h3>

            {description && !isIconOnly && !isMini && (
              <p className={cn("text-slate-500 mt-1", isCompact ? "text-xs" : "text-sm")}>
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
