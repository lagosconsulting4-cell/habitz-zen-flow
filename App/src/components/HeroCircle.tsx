import { getHabitIcon, HabitIconKey } from "./icons/HabitIcons";

interface HeroCircleProps {
  iconKey: HabitIconKey | null;
  color: string;
  isAutoTask?: boolean;
}

export const HeroCircle: React.FC<HeroCircleProps> = ({
  iconKey,
  color,
  isAutoTask = false,
}) => {
  const Icon = iconKey ? getHabitIcon(iconKey) : null;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      {/* Gray track circle */}
      <div className="absolute inset-0 rounded-full border-[6px] border-muted" />

      {/* Colored progress arc (270deg - 3/4 circle) */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray="364 364"
          strokeDashoffset="91"
          strokeLinecap="round"
        />
      </svg>

      {/* Icon container */}
      <div
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-inner"
        style={{
          backgroundColor: `${color}10`,
          borderColor: color,
          borderWidth: "2px",
          borderStyle: "solid",
        }}
      >
        {Icon && <Icon className="h-10 w-10" style={{ color }} />}
      </div>

      {/* Plus badge for auto tasks */}
      {isAutoTask && (
        <div
          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: color }}
        >
          <span className="text-lg font-bold text-black">+</span>
        </div>
      )}
    </div>
  );
};
