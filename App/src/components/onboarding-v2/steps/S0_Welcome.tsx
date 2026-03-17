import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { useOnboardingV2 } from "../OnboardingProviderV2";

const BG = "/assets/onboarding/welcome-bg.webp";

export const S0Welcome = () => {
  const { quizData, collectedName, setCollectedName, nextStep, isStepValid } = useOnboardingV2();
  const [localName, setLocalName] = useState(collectedName || "");
  const hasName = !!quizData?.name;
  const valid = isStepValid();

  useEffect(() => {
    if (!hasName) setCollectedName(localName.trim());
  }, [localName, hasName, setCollectedName]);

  return (
    <div className="h-[100dvh] relative bg-black overflow-hidden flex flex-col">

      {/* ── Fullscreen background image ── */}
      <motion.img
        src={BG}
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* ── Gradient overlay — topo limpo, escurece apenas na base ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.60) 68%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* ── Spacer — empurra conteúdo para o bottom (padrão S20) ── */}
      <div className="relative z-10 flex-1" />

      {/* ── Content ancorado no bottom ── */}
      <div
        className="relative z-10 flex-shrink-0 flex flex-col items-center px-6 text-center"
        style={{
          paddingBottom: "calc(130px + env(safe-area-inset-bottom, 0px))",
        }}
      >

        {/* Logo — acima do título, fundo branco 15% */}
        <motion.img
          src="/assets/logo-icon.png"
          alt="Bora"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            height: 48,
            width: 48,
            borderRadius: 15,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 14,
          }}
        />

        {hasName ? (
          <>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.15 }}
            >
              <span style={{ color: "hsl(var(--primary))" }}>{quizData!.name}</span>, que bom ter você.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.55, whiteSpace: "nowrap" }}
            >
              Que tal personalizar sua experiência?
            </motion.p>
          </>
        ) : (
          <>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.15 }}
            >
              Bem-vindo ao <span style={{ color: "hsl(var(--primary))" }}>Bora</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", marginBottom: 20, lineHeight: 1.55 }}
            >
              Como você se chama?
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="w-full max-w-xs"
            >
              <Input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Seu nome"
                className="text-center text-lg h-12 rounded-xl text-white placeholder:text-white/50 border-white/30 bg-white/10 focus-visible:ring-white/50 backdrop-blur-sm"
                autoFocus
              />
            </motion.div>
          </>
        )}
      </div>

      {/* ── Liquid glass CTA button ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="fixed bottom-0 inset-x-0 z-20 flex justify-center px-6 pt-4"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
        }}
      >
        <button
          onClick={nextStep}
          disabled={!valid}
          style={{
            width: "100%",
            maxWidth: 360,
            height: 56,
            borderRadius: 16,
            background: valid ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: valid
              ? "1px solid rgba(255,255,255,0.35)"
              : "1px solid rgba(255,255,255,0.12)",
            color: valid ? "white" : "rgba(255,255,255,0.25)",
            fontWeight: 600,
            fontSize: 17,
            cursor: valid ? "pointer" : "not-allowed",
            transition: "background 0.25s, border 0.25s, color 0.25s",
            boxShadow: valid
              ? "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20)"
              : "none",
          }}
        >
          Vamos lá
        </button>
      </motion.div>
    </div>
  );
};
