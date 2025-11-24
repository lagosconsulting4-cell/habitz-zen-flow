import { ChevronRight } from "lucide-react";

interface ConfigCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  onClick: () => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  icon,
  label,
  value,
  color,
  onClick,
}) => (
  <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
    <button
      type="button"
      className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-base font-semibold">{value}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  </div>
);
