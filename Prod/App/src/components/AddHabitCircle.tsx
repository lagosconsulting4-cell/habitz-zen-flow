import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AddHabitCircleProps {
  isDarkMode?: boolean;
  highlighted?: boolean; // Para destacar no empty state
}

export const AddHabitCircle = ({ isDarkMode = true, highlighted = false }: AddHabitCircleProps) => {
  const navigate = useNavigate();
  const size = highlighted ? 160 : 140; // Maior quando destacado

  // Cores adaptivas
  const limeGreen = "#A3E635";
  const colors = isDarkMode
    ? {
        border: highlighted ? limeGreen : `${limeGreen}40`, // Mais visível quando destacado
        icon: limeGreen,
        text: limeGreen,
        bg: highlighted ? `${limeGreen}10` : "transparent",
      }
    : {
        border: highlighted ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
        icon: "#FFFFFF",
        text: "#FFFFFF",
        bg: highlighted ? "rgba(255, 255, 255, 0.1)" : "transparent",
      };

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => navigate("/create")}
      className={cn(
        "flex flex-col items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 rounded-full",
        isDarkMode ? "focus-visible:ring-offset-black" : "focus-visible:ring-offset-primary"
      )}
      aria-label="Adicionar novo hábito"
    >
      {/* Círculo com animação de pulse sutil */}
      <div className="relative">
        {/* Pulse animation quando highlighted */}
        {highlighted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${isDarkMode ? limeGreen : "#FFFFFF"}`,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Glow animado no hover */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-300",
            highlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          style={{
            background: isDarkMode
              ? 'radial-gradient(circle, rgba(163, 230, 53, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            transform: 'scale(1.2)',
          }}
        />
        <motion.div
          className="relative rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            width: size,
            height: size,
            border: highlighted ? `3px solid ${colors.border}` : `4px dashed ${colors.border}`,
            backgroundColor: colors.bg,
          }}
          animate={highlighted ? { scale: [1, 1.02, 1] } : {}}
          transition={highlighted ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          <Plus
            size={highlighted ? 56 : 48}
            strokeWidth={2.5}
            className="drop-shadow-lg"
            style={{ color: colors.icon }}
          />
        </motion.div>
      </div>

      {/* Texto com altura fixa para alinhar com os outros cards */}
      <div className={cn("flex items-start justify-center", highlighted ? "h-auto" : "h-[48px]")}>
        <p
          className={cn(
            "font-extrabold uppercase tracking-wider drop-shadow-md",
            highlighted ? "text-base" : "text-sm"
          )}
          style={{ color: colors.text }}
        >
          {highlighted ? "CRIAR HÁBITO" : "ADICIONAR"}
        </p>
      </div>
    </motion.button>
  );
};
