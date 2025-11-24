import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AddHabitCircle = () => {
  const navigate = useNavigate();
  const size = 120;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/create")}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="rounded-full border-4 border-card flex items-center justify-center bg-transparent"
        style={{ width: size, height: size }}
      >
        <Plus size={48} color="white" strokeWidth={2.5} />
      </div>

      <p className="text-white font-bold text-xs uppercase tracking-wide">
        ADD A TASK
      </p>
    </motion.button>
  );
};
