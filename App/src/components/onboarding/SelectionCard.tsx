import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  variant?: "default" | "compact" | "icon-only";
  multiselect?: boolean;
}

export const SelectionCard = ({
  id,
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
  const isIconOnly = variant === "icon-only";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Card
        className={cn(
          "relative cursor-pointer transition-all duration-300",
          "border-2",
          selected
            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md shadow-primary/20"
            : "border-border hover:border-primary/50 hover:shadow-sm",
          disabled && "opacity-50 cursor-not-allowed",
          isIconOnly ? "p-4" : isCompact ? "p-4" : "p-6",
          className
        )}
        onClick={disabled ? undefined : onClick}
      >
        {/* Selection Indicator */}
        <motion.div
          className={cn(
            "absolute inset-y-0 right-3 flex items-center justify-center",
            selected
              ? "text-primary-foreground"
              : ""
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: selected ? 1 : multiselect ? 1 : 0,
            opacity: selected ? 1 : multiselect ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.4
          }}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              selected
                ? "bg-primary text-primary-foreground"
                : multiselect
                  ? "border-2 border-border dark:border-muted-foreground/50"
                  : ""
            )}
          >
            {selected && <Check className="h-3 w-3" strokeWidth={3} />}
          </div>
        </motion.div>

        {/* Content */}
        <div
          className={cn(
            "flex items-center gap-4",
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
                  : isCompact
                    ? "w-12 h-12 text-2xl"
                    : "w-14 h-14 text-3xl",
                !emoji && "bg-muted p-3"
              )}
              animate={{ rotate: selected ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.3 }}
            >
              {emoji ? emoji : icon}
            </motion.div>
          )}

          {/* Text Content */}
          <div className={cn("flex-1", isIconOnly && "w-full")}>
            <h3
              className={cn(
                "font-bold text-foreground leading-tight",
                isIconOnly ? "text-sm mt-2" : isCompact ? "text-base" : "text-lg"
              )}
            >
              {title}
            </h3>

            {description && !isIconOnly && (
              <p
                className={cn(
                  "text-muted-foreground mt-1",
                  isCompact ? "text-xs" : "text-sm"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 to-primary/0 pointer-events-none"
          animate={{
            background: selected
              ? "linear-gradient(to bottom right, rgba(var(--primary), 0.05), rgba(var(--primary), 0))"
              : "linear-gradient(to bottom right, rgba(var(--primary), 0), rgba(var(--primary), 0))",
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};

// Variants for common use cases
export const SelectionCardGrid = ({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};
