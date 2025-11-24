import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, Menu, Settings, Grid3x3 } from "lucide-react";
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

  const isDashboard = location.pathname === "/dashboard";
  const limeGreen = "#A3E635";

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
    const iconColor = isDashboard
      ? (isActive ? limeGreen : "#ffffff80")
      : (isActive ? "currentColor" : "currentColor");

    return (
      <motion.button
        type="button"
        onClick={onClick ?? (() => path && handleNavigate(path))}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center justify-center rounded-full p-3 transition-colors",
          !isDashboard && (isActive ? "text-primary" : "text-muted-foreground")
        )}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} style={{ color: iconColor }} />
      </motion.button>
    );
  };

  const navBg = isDashboard
    ? "bg-[#1a1a1a]"
    : "bg-card/95 backdrop-blur-md border-t border-border/60";

  const borderStyle = isDashboard ? { borderTop: `2px solid ${limeGreen}` } : {};

  return (
    <div
      className={cn("fixed inset-x-0 bottom-0 z-40 safe-area-bottom md:hidden", navBg)}
      style={borderStyle}
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-3 items-center px-8 py-4">
        {renderButton({ label: "Config", icon: Settings, path: "/profile" })}
        {renderButton({ label: "Menu", icon: Grid3x3, onClick: onOpenMore })}
        {renderButton({ label: "Streaks", icon: TrendingUp, path: "/progress" })}
      </div>
    </div>
  );
};

export default NavigationBar;
