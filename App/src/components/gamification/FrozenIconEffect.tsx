import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FrozenIconEffectProps {
  children: ReactNode;
  isFrozen: boolean;
  size?: "sm" | "md" | "lg";
}

// Tamanhos da esfera de gelo
const SPHERE_SIZES = {
  sm: "w-10 h-10", // 40px
  md: "w-14 h-14", // 56px
  lg: "w-20 h-20", // 80px
};

/**
 * FrozenIconEffect Component
 *
 * Aplica um efeito visual de "ícone encapsulado em esfera de gelo 3D" baseado em imagem de referência:
 * - Esfera translúcida com gradiente branco → azul claro
 * - Bolhas de ar animadas dentro do gelo
 * - Pingos de gelo (icicles) na parte inferior
 * - Glow pulsante ao redor
 * - Borda azul/cyan fina
 *
 * Uso:
 * <FrozenIconEffect isFrozen={freezeWasUsedToday} size="md">
 *   <Flame className="w-6 h-6" />
 * </FrozenIconEffect>
 */
export function FrozenIconEffect({
  children,
  isFrozen,
  size = "md",
}: FrozenIconEffectProps) {
  // Se não congelado, apenas renderizar o ícone normalmente
  if (!isFrozen) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative inline-block"
    >
      {/* Esfera de gelo container principal */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "border-2 border-cyan-400/60",
          "shadow-[0_0_20px_rgba(6,182,212,0.3),inset_0_0_15px_rgba(255,255,255,0.5)]",
          "backdrop-blur-sm",
          SPHERE_SIZES[size]
        )}
        style={{
          // Gradiente radial: branco no centro → azul claro nas bordas
          background: `radial-gradient(ellipse at center,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(219, 234, 254, 0.85) 100%)`,
        }}
      >
        {/* Ícone interno (com opacidade reduzida para parecer "dentro do gelo") */}
        <div className="opacity-75 scale-90 relative z-10">
          {children}
        </div>

        {/* ========== BOLHAS DE AR ANIMADAS ========== */}
        {/* Bolha 1 - Canto superior esquerdo */}
        <motion.div
          className="absolute top-2 left-3 w-1 h-1 rounded-full bg-white/70"
          animate={{ y: [0, -2, 0], x: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ zIndex: 5 }}
        />

        {/* Bolha 2 - Canto superior direito */}
        <motion.div
          className="absolute top-4 right-2 w-1.5 h-1.5 rounded-full bg-white/60"
          animate={{ y: [0, -3, 0], x: [0, -1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ zIndex: 5 }}
        />

        {/* Bolha 3 - Canto inferior esquerdo */}
        <motion.div
          className="absolute bottom-3 left-2 w-0.5 h-0.5 rounded-full bg-white/80"
          animate={{ y: [0, -1, 0], x: [0, -1, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ zIndex: 5 }}
        />

        {/* Bolha 4 - Lado direito */}
        <motion.div
          className="absolute top-1/2 right-3 w-1 h-1 rounded-full bg-white/50 -translate-y-1/2"
          animate={{ y: [0, -2, 0], x: [0, -1, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          style={{ zIndex: 5 }}
        />

        {/* Reflexo/brilho superior */}
        <div className="absolute top-1 left-1/4 w-1/3 h-1/4 rounded-full bg-white/40 blur-sm pointer-events-none" />
      </div>

      {/* ========== PINGOS DE GELO (ICICLES) NA PARTE INFERIOR ========== */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
        {/* Icicle 1 - Maior à esquerda */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderTop: "10px solid rgba(219, 234, 254, 0.8)",
            filter: "drop-shadow(0 2px 4px rgba(6, 182, 212, 0.2))",
          }}
        />

        {/* Icicle 2 - Pequeno no centro */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "2px solid transparent",
            borderRight: "2px solid transparent",
            borderTop: "8px solid rgba(219, 234, 254, 0.7)",
            filter: "drop-shadow(0 2px 4px rgba(6, 182, 212, 0.2))",
          }}
        />

        {/* Icicle 3 - Maior à direita */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderTop: "12px solid rgba(219, 234, 254, 0.85)",
            filter: "drop-shadow(0 2px 4px rgba(6, 182, 212, 0.2))",
          }}
        />
      </div>

      {/* ========== GLOW ANIMADO AO REDOR ========== */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 15px rgba(6, 182, 212, 0.4)",
            "0 0 25px rgba(6, 182, 212, 0.6)",
            "0 0 15px rgba(6, 182, 212, 0.4)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default FrozenIconEffect;
