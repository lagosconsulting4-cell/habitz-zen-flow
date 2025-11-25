import { getHabitIcon, HabitIconKey } from "./icons/HabitIcons";
import { cn } from "@/lib/utils";

interface HeroCircleProps {
  iconKey: HabitIconKey | null;
  color: string;
  isAutoTask?: boolean;
  size?: "default" | "lg";
}

const sizeConfig = {
  default: {
    container: "h-32 w-32",
    borderWidth: "6",
    svgViewBox: "0 0 128 128",
    circleCenter: 64,
    circleRadius: 58,
    strokeWidth: 6,
    dashArray: "364 364",
    dashOffset: 91,
    iconContainer: "h-20 w-20",
    iconSize: "h-10 w-10",
    badge: "h-8 w-8 bottom-1 right-1",
    badgeText: "text-lg",
  },
  lg: {
    container: "h-40 w-40",
    borderWidth: "7",
    svgViewBox: "0 0 160 160",
    circleCenter: 80,
    circleRadius: 72,
    strokeWidth: 7,
    dashArray: "452 452",
    dashOffset: 113,
    iconContainer: "h-24 w-24",
    iconSize: "h-12 w-12",
    badge: "h-9 w-9 bottom-2 right-2",
    badgeText: "text-xl",
  },
};

export const HeroCircle: React.FC<HeroCircleProps> = ({
  iconKey,
  color,
  isAutoTask = false,
  size = "default",
}) => {
  const Icon = iconKey ? getHabitIcon(iconKey) : null;
  const config = sizeConfig[size];

  return (
    <div className={cn("relative flex items-center justify-center", config.container)}>
      {/* Gray track circle */}
      <div
        className="absolute inset-0 rounded-full border-muted"
        style={{ borderWidth: `${config.borderWidth}px` }}
      />

      {/* Colored progress arc (270deg - 3/4 circle) */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox={config.svgViewBox}
      >
        <circle
          cx={config.circleCenter}
          cy={config.circleCenter}
          r={config.circleRadius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeDasharray={config.dashArray}
          strokeDashoffset={config.dashOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Icon container */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full bg-card shadow-inner",
          config.iconContainer
        )}
        style={{
          backgroundColor: `${color}10`,
          borderColor: color,
          borderWidth: "2px",
          borderStyle: "solid",
        }}
      >
        {Icon && <Icon className={config.iconSize} style={{ color }} />}
      </div>

      {/* Plus badge for auto tasks */}
      {isAutoTask && (
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full shadow-lg",
            config.badge
          )}
          style={{ backgroundColor: color }}
        >
          <span className={cn("font-bold text-black", config.badgeText)}>+</span>
        </div>
      )}
    </div>
  );
};
