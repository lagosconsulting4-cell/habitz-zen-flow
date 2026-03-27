/**
 * FloatingActionButton — FAB for creating standalone habits
 * Replaces the "Adicionar" tab that was removed from nav
 */

import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname !== "/habits") return null;

  return createPortal(
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate("/create")}
      className={cn(
        "fixed right-4 z-[45] toast-bottom",
        "w-14 h-14 rounded-full",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "flex items-center justify-center",
        "shadow-lg shadow-primary/25",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 focus-visible:ring-offset-2",
        className
      )}
      aria-label="Criar novo hábito"
    >
      <Plus className="w-6 h-6" />
    </motion.button>,
    document.body
  );
};

export default FloatingActionButton;
