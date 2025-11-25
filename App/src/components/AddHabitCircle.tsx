import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AddHabitCircle = () => {
  const navigate = useNavigate();
  const size = 140;
  const limeGreen = "#A3E635";

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => navigate("/create")}
      className="flex flex-col items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full"
      aria-label="Adicionar novo hábito"
    >
      <div
        className="rounded-full flex items-center justify-center bg-transparent transition-all duration-300 group-hover:shadow-xl"
        style={{
          width: size,
          height: size,
          border: `6px solid ${limeGreen}40`,
        }}
      >
        <Plus size={56} strokeWidth={3} className="drop-shadow-lg" style={{ color: limeGreen }} />
      </div>

      <p className="font-extrabold text-sm uppercase tracking-wider drop-shadow-md" style={{ color: limeGreen }}>
        ADICIONAR
      </p>
    </motion.button>
  );
};
