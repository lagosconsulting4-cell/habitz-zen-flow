import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AddHabitCircle = () => {
  const navigate = useNavigate();
  const size = 140;

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => navigate("/create")}
      className="flex flex-col items-center gap-3 group"
    >
      <div
        className="rounded-full border-[6px] border-white/80 flex items-center justify-center bg-transparent transition-all duration-300 group-hover:border-white group-hover:shadow-xl"
        style={{ width: size, height: size }}
      >
        <Plus size={56} color="white" strokeWidth={3} className="drop-shadow-lg" />
      </div>

      <p className="text-white font-extrabold text-sm uppercase tracking-wider drop-shadow-md">
        ADICIONAR
      </p>
    </motion.button>
  );
};
