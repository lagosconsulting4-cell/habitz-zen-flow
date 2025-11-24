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
          "flex items-center justify-center rounded-full p-3 transition-colors",
          isActive ? "text-white" : "text-white/70"
        )}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} />
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-transparent safe-area-bottom md:hidden">
      <div className="mx-auto grid w-full max-w-md grid-cols-3 items-center px-8 py-4">
        {renderButton({ label: "Config", icon: Settings, path: "/profile" })}
        {renderButton({ label: "Menu", icon: Menu, onClick: onOpenMore })}
        {renderButton({ label: "Streaks", icon: TrendingUp, path: "/progress" })}
      </div>
    </div>
  );
};

export default NavigationBar;
