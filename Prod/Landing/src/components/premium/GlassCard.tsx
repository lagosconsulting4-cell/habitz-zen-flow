import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { cardHover } from "@/hooks/useAnimations";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "default",
  hover = false,
  className,
  ...props
}) => {
  const variantClasses = {
    default: "glass-card",
    strong: "glass-card-strong",
    subtle: "backdrop-blur-sm bg-card/50 border border-border/20 rounded-2xl",
  };

  return (
    <motion.div
      className={cn(variantClasses[variant], className)}
      {...(hover ? cardHover : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
