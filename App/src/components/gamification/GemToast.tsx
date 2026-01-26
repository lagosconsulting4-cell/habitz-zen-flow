import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GemNotification {
  id: number;
  amount: number;
}

export const GemToast = () => {
  const [notifications, setNotifications] = useState<GemNotification[]>([]);
  const [lastBalance, setLastBalance] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { newBalance } = e.detail;

      // Calculate amount gained (if we have previous balance)
      if (lastBalance !== null && newBalance > lastBalance) {
        const amount = newBalance - lastBalance;
        const id = Date.now();

        setNotifications((prev) => [...prev, { id, amount }]);

        // Auto-remove after animation
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 2500);
      }

      setLastBalance(newBalance);
    };

    window.addEventListener("gamification:gems-changed" as any, handler);
    return () => window.removeEventListener("gamification:gems-changed" as any, handler);
  }, [lastBalance]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "px-4 py-2 rounded-full shadow-lg mb-2",
              "bg-gradient-to-r from-purple-600 to-purple-500",
              "text-white font-bold text-sm",
              "flex items-center gap-2"
            )}
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>+{notification.amount} gems</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GemToast;
