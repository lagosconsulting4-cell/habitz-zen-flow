import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, Menu, Settings } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface NavigationBarProps {
  onOpenMore?: () => void;
}

const NavigationBar = ({ onOpenMore }: NavigationBarProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const renderButton = ({
    label,
    icon: Icon,
    path,
    onClick,
  }: {
    label: string;
    icon: typeof Settings;
    path?: string;
    onClick?: () => void;
  }) => {
    const isActive = path ? location.pathname === path : false;
    return (
      <motion.button
        type="button"
        onClick={onClick ?? (() => path && handleNavigate(path))}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 text-[11px] font-medium transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border border-border/60 bg-card/95 shadow-[var(--shadow-medium)] backdrop-blur-md safe-area-bottom md:hidden">
      <div className="mx-auto grid w-full max-w-md grid-cols-3 items-center px-4 py-3">
        {renderButton({ label: "Config", icon: Settings, path: "/profile" })}
        {renderButton({ label: "Menu", icon: Menu, onClick: onOpenMore })}
        {renderButton({ label: "Streaks", icon: TrendingUp, path: "/progress" })}
      </div>
    </div>
  );
};

export default NavigationBar;
