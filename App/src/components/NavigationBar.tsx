import { useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, Menu, Settings, Grid3x3 } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface NavigationBarProps {
  onOpenMore?: () => void;
  isDarkMode?: boolean;
}

const NavigationBar = ({ onOpenMore, isDarkMode = true }: NavigationBarProps = {}) => {
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

    // Cores para o Dashboard
    let iconColor: string;
    if (isDashboard) {
      if (isDarkMode) {
        // Dark mode: verde ativo, branco transparente inativo
        iconColor = isActive ? limeGreen : "#ffffff80";
      } else {
        // Light mode (fundo verde): branco ativo, branco transparente inativo
        iconColor = isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)";
      }
    } else {
      iconColor = "currentColor";
    }

    return (
      <motion.button
        type="button"
        onClick={onClick ?? (() => path && handleNavigate(path))}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center justify-center rounded-full p-3 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !isDashboard && (isActive ? "text-primary" : "text-muted-foreground")
        )}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} style={{ color: iconColor }} />
      </motion.button>
    );
  };

  // Background da navbar no Dashboard
  let navBg: string;
  let borderStyle: React.CSSProperties;

  if (isDashboard) {
    if (isDarkMode) {
      // Dark mode: fundo escuro com borda verde
      navBg = "bg-[#1a1a1a]";
      borderStyle = { borderTop: `2px solid ${limeGreen}` };
    } else {
      // Light mode (fundo verde): fundo escuro para contraste
      navBg = "bg-[#1a1a1a]/90 backdrop-blur-md";
      borderStyle = { borderTop: "2px solid rgba(255, 255, 255, 0.3)" };
    }
  } else {
    navBg = "bg-card/95 backdrop-blur-md border-t border-border/60";
    borderStyle = {};
  }

  return (
    <nav
      className={cn("fixed inset-x-0 bottom-0 z-40 safe-area-bottom md:hidden", navBg)}
      style={borderStyle}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-3 items-center px-8 py-4">
        {renderButton({ label: "Config", icon: Settings, path: "/profile" })}
        {renderButton({ label: "Menu", icon: Grid3x3, onClick: onOpenMore })}
        {renderButton({ label: "Streaks", icon: TrendingUp, path: "/progress" })}
      </div>
    </nav>
  );
};

export default NavigationBar;
