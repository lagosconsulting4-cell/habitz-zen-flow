import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AddHabitCircleProps {
  isDarkMode?: boolean;
}

export const AddHabitCircle = ({ isDarkMode = true }: AddHabitCircleProps) => {
  const navigate = useNavigate();
  const size = 140;

  // Cores adaptivas
  const limeGreen = "#A3E635";
  const colors = isDarkMode
    ? {
        border: `${limeGreen}40`, // Verde translúcido
        icon: limeGreen,
        text: limeGreen,
      }
    : {
        border: "rgba(255, 255, 255, 0.4)", // Branco translúcido
        icon: "#FFFFFF",
        text: "#FFFFFF",
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
      <div
        className="rounded-full flex items-center justify-center bg-transparent transition-all duration-300 group-hover:shadow-xl"
        style={{
          width: size,
          height: size,
          border: `6px solid ${colors.border}`,
        }}
      >
        <Plus size={56} strokeWidth={3} className="drop-shadow-lg" style={{ color: colors.icon }} />
      </div>

      <p className="font-extrabold text-sm uppercase tracking-wider drop-shadow-md" style={{ color: colors.text }}>
        ADICIONAR
      </p>
    </motion.button>
  );
};
