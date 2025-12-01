import { motion } from "motion/react";
import {
  Target, Sun, Zap, Moon, Brain, Heart, Dumbbell,
  BookOpen, Coffee, Droplets, type LucideIcon
} from "lucide-react";
import { progressCircle } from "@/hooks/useAnimations";

// Available icons for the landing page hero
const iconMap: Record<string, LucideIcon> = {
  target: Target,
  sun: Sun,
  zap: Zap,
  moon: Moon,
  brain: Brain,
  heart: Heart,
  dumbbell: Dumbbell,
  book: BookOpen,
  coffee: Coffee,
  water: Droplets,
};

interface HeroCircleProps {
  iconKey?: keyof typeof iconMap;
  color?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    container: "h-24 w-24",
    svg: "h-full w-full",
    viewBox: "0 0 96 96",
    cx: 48,
    cy: 48,
    r: 42,
    strokeWidth: 5,
    iconContainer: "h-14 w-14",
    iconSize: 28,
    dashArray: "264 264",
    dashOffset: { initial: 264, animate: 66 },
  },
  md: {
    container: "h-32 w-32",
    svg: "h-full w-full",
    viewBox: "0 0 128 128",
    cx: 64,
    cy: 64,
    r: 58,
    strokeWidth: 6,
    iconContainer: "h-20 w-20",
    iconSize: 40,
    dashArray: "364 364",
    dashOffset: { initial: 364, animate: 91 },
  },
  lg: {
    container: "h-40 w-40",
    svg: "h-full w-full",
    viewBox: "0 0 160 160",
    cx: 80,
    cy: 80,
    r: 72,
    strokeWidth: 7,
    iconContainer: "h-24 w-24",
    iconSize: 48,
    dashArray: "452 452",
    dashOffset: { initial: 452, animate: 113 },
  },
};

export const HeroCircle: React.FC<HeroCircleProps> = ({
  iconKey = "target",
  color = "#A3E635",
  animated = true,
  size = "md",
}) => {
  const Icon = iconMap[iconKey] || Target;
  const config = sizeConfig[size];

  return (
    <div className={`relative flex ${config.container} items-center justify-center`}>
      {/* Gray track circle */}
      <div
        className="absolute inset-0 rounded-full border-muted"
        style={{ borderWidth: `${config.strokeWidth}px` }}
      />

      {/* Colored progress arc (270deg - 3/4 circle) */}
      <svg
        className={`absolute inset-0 ${config.svg} -rotate-90`}
        viewBox={config.viewBox}
      >
        {animated ? (
          <motion.circle
            cx={config.cx}
            cy={config.cy}
            r={config.r}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={config.dashArray}
            strokeLinecap="round"
            initial={{ strokeDashoffset: config.dashOffset.initial }}
            animate={{ strokeDashoffset: config.dashOffset.animate }}
            transition={progressCircle.transition}
          />
        ) : (
          <circle
            cx={config.cx}
            cy={config.cy}
            r={config.r}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={config.dashArray}
            strokeDashoffset={config.dashOffset.animate}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* Icon container */}
      <motion.div
        className={`relative z-10 flex ${config.iconContainer} items-center justify-center rounded-full shadow-inner`}
        style={{
          backgroundColor: `${color}10`,
          borderColor: color,
          borderWidth: "2px",
          borderStyle: "solid",
        }}
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
      >
        <Icon
          size={config.iconSize}
          style={{ color }}
          strokeWidth={2}
        />
      </motion.div>
    </div>
  );
};

export default HeroCircle;
