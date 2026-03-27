import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Snowflake, Gem, Check, ChevronRight, Loader2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGamification, GEM_VALUES } from "@/hooks/useGamification";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface FreezeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const FreezeShopModal = ({ isOpen, onClose, userId }: FreezeShopModalProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [showSuccess, setShowSuccess] = useState<"freeze" | "meditation" | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [purchasedFreezeCount, setPurchasedFreezeCount] = useState<number | null>(null);

  const {
    gemsBalance,
    streakFreezes,
    purchaseStreakFreeze,
    isPurchasingFreeze,
    progress,
    weeklyFreezePurchases,
  } = useGamification(userId);

  const currentGems = gemsBalance || 0;
  const weeklyPurchases = weeklyFreezePurchases?.count || 0;
  const canAfford = currentGems >= GEM_VALUES.STREAK_FREEZE_COST;
  const canPurchase = canAfford && weeklyPurchases < 3;

  const handlePurchase = async () => {
    if (!canPurchase) return;
    try {
      const result = await purchaseStreakFreeze();
      if (result?.available_freezes !== undefined) {
        setPurchasedFreezeCount(result.available_freezes);
      }
      setShowSuccess("freeze");
    } catch (error) {
      console.error("Erro ao comprar freeze:", error);
    }
  };

  const handleClose = () => {
    setShowSuccess(null);
    setPurchasedFreezeCount(null);
    onClose();
  };

  if (!isOpen) return null;

  // Shared card styles
  const cardStyle = isDark ? {
    background: "linear-gradient(145deg, #1c1c1c 0%, #141414 100%)",
    boxShadow: "0 0 40px rgba(163,230,53,0.03), 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  } : undefined;
  const cardClass = isDark
    ? "border border-white/[0.08]"
    : "bg-white border border-gray-100 shadow-sm";

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop — hidden in full-screen shop, visible for success popup */}

        {/* Success State */}
        <AnimatePresence>
          {showSuccess && (
            <>
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-sm mx-4 rounded-3xl overflow-hidden px-6 py-10 flex flex-col items-center text-center"
              style={isDark ? {
                backgroundColor: "#0A0A0A",
                boxShadow: "0 0 80px rgba(163,230,53,0.06), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              } : { backgroundColor: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
            >
              {/* Ambient glow */}
              {isDark && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 70%)" }} />
              )}

              {/* Check circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, #A3E635, #65A30D)",
                  boxShadow: "0 0 50px rgba(163,230,53,0.45), 0 0 100px rgba(163,230,53,0.15), 0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>

              <h2 className={cn("relative z-10 text-2xl font-bold", isDark ? "text-white" : "text-foreground")}>
                Compra Realizada!
              </h2>
              <p className={cn("relative z-10 text-sm mt-2 max-w-[250px]", isDark ? "text-white/50" : "text-muted-foreground")}>
                {showSuccess === "freeze"
                  ? <>Você adquiriu um <span className={cn("font-bold", isDark ? "text-sky-300" : "text-sky-600")}>Streak Freeze</span> com sucesso.</>
                  : <>Você desbloqueou <span className={cn("font-bold", isDark ? "text-lime-300" : "text-lime-600")}>Meditações Exclusivas</span> com sucesso.</>
                }
              </p>

              {/* Item card */}
              <div
                className={cn("relative z-10 flex items-center gap-3 w-full rounded-2xl p-4 mt-6", isDark ? "border border-white/[0.08]" : "bg-gray-50 border border-gray-100")}
                style={isDark ? {
                  background: "linear-gradient(145deg, #1c1c1c 0%, #141414 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                } : undefined}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", showSuccess === "freeze" ? (isDark ? "bg-sky-400/15" : "bg-sky-100") : (isDark ? "bg-lime-400/15" : "bg-lime-100"))}>
                  {showSuccess === "freeze"
                    ? <Snowflake className={cn("w-5 h-5", isDark ? "text-sky-300" : "text-sky-600")} />
                    : <Headphones className={cn("w-5 h-5", isDark ? "text-lime-300" : "text-lime-600")} />
                  }
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-foreground")}>
                    {showSuccess === "freeze" ? "Streak Freeze" : "Meditações Exclusivas"}
                  </p>
                  <p className={cn("text-[10px] uppercase tracking-widest", showSuccess === "freeze" ? (isDark ? "text-sky-400/60" : "text-sky-600/60") : (isDark ? "text-lime-400/60" : "text-lime-600/60"))}>
                    {showSuccess === "freeze" ? "Proteção Ativa" : "Conteúdo Desbloqueado"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs", isDark ? "text-white/30" : "text-muted-foreground")}>—</span>
                  <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-foreground")}>
                    {showSuccess === "freeze" ? GEM_VALUES.STREAK_FREEZE_COST : 800}
                  </span>
                  <Gem className="w-3.5 h-3.5 text-lime-400" />
                  <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-muted-foreground")}>Gemas</span>
                </div>
              </div>

              {/* Freeze count after purchase */}
              {showSuccess === "freeze" && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn("relative z-10 text-xs mt-3", isDark ? "text-white/30" : "text-muted-foreground")}
                >
                  Você agora tem <span className={cn("font-bold", isDark ? "text-sky-300" : "text-sky-600")}>{purchasedFreezeCount ?? (streakFreezes?.available_freezes || 0)}</span> freeze{(purchasedFreezeCount ?? (streakFreezes?.available_freezes || 0)) !== 1 ? "s" : ""} disponíve{(purchasedFreezeCount ?? (streakFreezes?.available_freezes || 0)) !== 1 ? "is" : "l"}
                </motion.p>
              )}

              <Button
                onClick={handleClose}
                className="relative z-10 w-full h-12 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-sm border-0 mt-6 uppercase tracking-wider"
                style={{ boxShadow: "0 4px 30px rgba(163,230,53,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)" }}
              >
                Excelente
              </Button>
            </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Shop Content */}
        {!showSuccess && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute inset-0 overflow-y-auto scrollbar-hide",
              isDark ? "" : "bg-white"
            )}
            style={isDark ? { backgroundColor: "#0A0A0A" } : undefined}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={isDark ? { backgroundColor: "#0A0A0A" } : { backgroundColor: "#fff" }}>
              <button onClick={handleClose} className={cn("p-1.5 rounded-full", isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-600")}>
                <X size={20} />
              </button>
              <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-foreground")}>Loja de Gemas</h2>
              <div className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", isDark ? "bg-lime-400/15 text-lime-300" : "bg-lime-100 text-lime-700")}>
                  <Gem className="w-3.5 h-3.5" />
                  {currentGems.toLocaleString()}
                </div>
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold", isDark ? "bg-sky-400/15 text-sky-300" : "bg-sky-100 text-sky-700")}>
                  <Snowflake className="w-3.5 h-3.5" />
                  {streakFreezes?.available_freezes || 0}
                </div>
              </div>
            </div>

            {/* Featured: Streak Freeze */}
            <div className="px-5 pb-5">
              <div
                className={cn(
                  "rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden",
                  isDark ? "border border-sky-400/10" : "bg-white border border-gray-100 shadow-lg"
                )}
                style={isDark ? {
                  background: "linear-gradient(160deg, #1a1e2e 0%, #181818 40%, #141414 100%)",
                  boxShadow: "0 0 60px rgba(56,189,248,0.06), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
                } : undefined}
              >
                {/* Ambient glow blob */}
                {isDark && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)" }} />
                )}

                <span className={cn("relative z-10 text-[9px] uppercase tracking-[0.2em] font-bold mb-4 px-3 py-1 rounded-full", isDark ? "bg-sky-400/10 text-sky-400" : "bg-sky-100 text-sky-700")}>
                  Destaque
                </span>
                <div
                  className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={isDark ? {
                    backgroundColor: "rgba(56,189,248,0.12)",
                    boxShadow: "0 0 24px rgba(56,189,248,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                  } : { backgroundColor: "#f0f9ff" }}
                >
                  <Snowflake className={cn("w-8 h-8", isDark ? "text-sky-300" : "text-sky-600")} style={isDark ? { filter: "drop-shadow(0 0 6px rgba(56,189,248,0.4))" } : undefined} />
                </div>
                <h3 className={cn("relative z-10 text-xl font-bold mb-2", isDark ? "text-white" : "text-foreground")}>
                  Streak Freeze
                </h3>
                <p className={cn("relative z-10 text-xs leading-relaxed max-w-[240px] mb-5", isDark ? "text-white/40" : "text-muted-foreground")}>
                  Proteja sua sequência de vitórias mesmo naqueles dias em que o foco foge.
                </p>

                <div className="relative z-10 flex items-center gap-1.5 mb-4">
                  <span className={cn("text-[10px] uppercase tracking-wider", isDark ? "text-white/30" : "text-muted-foreground")}>
                    Preço Individual
                  </span>
                  <Gem className="w-3.5 h-3.5 text-sky-400" />
                  <span className={cn("text-lg font-bold", isDark ? "text-sky-300" : "text-sky-600")} style={isDark ? { textShadow: "0 0 12px rgba(56,189,248,0.4)" } : undefined}>
                    {GEM_VALUES.STREAK_FREEZE_COST}
                  </span>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={!canPurchase || isPurchasingFreeze}
                  className="relative z-10 w-full h-12 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 hover:from-sky-200 hover:to-sky-400 text-black font-bold text-sm border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ boxShadow: canPurchase ? "0 4px 30px rgba(56,189,248,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)" : "none" }}
                >
                  {isPurchasingFreeze ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {!canAfford
                    ? "Gemas Insuficientes"
                    : weeklyPurchases >= 3
                      ? "Limite Semanal Atingido"
                      : "Comprar Agora"}
                </Button>
              </div>
            </div>

            {/* Bonus Content */}
            <div className="px-5 pb-5">
              <h3 className={cn("text-base font-bold mb-3", isDark ? "text-white" : "text-foreground")}>
                Conteúdo Bônus
              </h3>
              <div
                className={cn("rounded-2xl overflow-hidden relative h-40", isDark ? "border border-white/[0.08]" : "border border-gray-100 shadow-lg")}
                style={isDark ? {
                  boxShadow: "0 0 40px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                } : undefined}
              >
                {/* Background image */}
                <img
                  src={`${import.meta.env.BASE_URL}images/meditation-bg.jpg`}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)" }} />

                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 rounded-md bg-white/15 backdrop-blur-sm text-white/80">
                      Pacote Mestre
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm">
                      <Gem className="w-3 h-3 text-lime-400" />
                      <span className="text-xs font-bold text-lime-300">800</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <h4 className="text-lg font-bold text-white leading-tight">
                      Meditações<br />Exclusivas
                    </h4>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer — flush to bottom edges */}
            <div
              className={cn("sticky bottom-0 px-5 py-3.5 flex items-center gap-3", isDark ? "border-t border-white/[0.06]" : "bg-gray-50 border-t border-gray-100")}
              style={isDark ? { background: "linear-gradient(145deg, #151515 0%, #0e0e0e 100%)" } : undefined}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-lime-400 flex-shrink-0" style={{ boxShadow: "0 0 8px rgba(163,230,53,0.4)" }} />
              <div className="flex-1">
                <p className={cn("text-[10px] uppercase tracking-widest font-bold", isDark ? "text-lime-400/70" : "text-lime-600")}>
                  Saldo Disponível
                </p>
                <p className={cn("text-[11px]", isDark ? "text-white/30" : "text-muted-foreground")}>
                  Você pode resgatar novos itens agora
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors", isDark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-gray-200 text-gray-500")}
                >
                  !
                </button>
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "absolute bottom-full right-0 mb-2 w-56 rounded-xl p-3 text-[11px] leading-relaxed z-20",
                        isDark ? "bg-[#222] border border-white/10 text-white/60" : "bg-white border border-gray-200 text-gray-600 shadow-lg"
                      )}
                    >
                      <p className={cn("font-bold mb-1 text-xs", isDark ? "text-white/80" : "text-gray-800")}>Como ganhar gemas</p>
                      Hábitos (+10), dias perfeitos (+20), streaks (+15/+50/+150) e jornadas.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FreezeShopModal;
