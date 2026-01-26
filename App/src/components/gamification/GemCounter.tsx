import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";

interface GemCounterProps {
  userId?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  showAnimation?: boolean;
}

export const GemCounter = ({
  userId: propUserId,
  size = "md",
  onClick,
  className,
  showAnimation = true,
}: GemCounterProps) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;

  const { gemsBalance, gemsLoading } = useGamification(userId);

  if (gemsLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-8 w-20 bg-muted/20 rounded-full" />
      </div>
    );
  }

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.button
      onClick={onClick}
      initial={showAnimation ? { scale: 0.9, opacity: 0 } : undefined}
      animate={showAnimation ? { scale: 1, opacity: 1 } : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center rounded-full font-bold transition-all",
        "bg-gradient-to-r from-purple-600 to-purple-500",
        "text-white shadow-md hover:shadow-lg",
        "hover:from-purple-500 hover:to-purple-400",
        "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
        sizeClasses[size],
        className
      )}
      aria-label={`${gemsBalance} gems disponíveis. Clique para abrir a loja.`}
    >
      <Sparkles className={cn(iconSizes[size], "text-purple-200")} />
      <span>{gemsBalance.toLocaleString()}</span>
    </motion.button>
  );
};

export default GemCounter;
