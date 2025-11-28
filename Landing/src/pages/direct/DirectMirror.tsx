import React, { useState, useCallback, useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence } from "motion/react";
import StressBar from "@/components/direct/StressBar";
import { getStressStatus } from "@/components/direct/stress-status";
import FlipCard from "@/components/direct/FlipCard";
import { flipCardsData, getCardContent } from "@/components/direct/flip-card-data";
import ColapsoScreen from "@/components/direct/ColapsoScreen";
import TransicaoScreen from "@/components/direct/TransicaoScreen";
import TwoPathsComparison from "@/components/direct/TwoPathsComparison";

// Mirror phases state machine
type MirrorPhase = "dor" | "colapso" | "transicao" | "bora" | "comparison";

const STRESS_CURVES = {
  dor: [0, 18, 42, 68, 94, 118, 136, 150],
  bora: [150, 120, 92, 68, 48, 30, 18, 12],
} as const;

const DirectMirror = () => {
  const navigate = usePathAwareNavigate();

  // State
  const [phase, setPhase] = useState<MirrorPhase>("dor");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stressLevel, setStressLevel] = useState(0); // Starts at 0% - progressive

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Calculate stress usando curvas customizadas para uma transi??o mais fluida

  useEffect(() => {

    if (phase === "dor" || phase === "bora") {

      const curve = STRESS_CURVES[phase];

      const fallback = curve[curve.length - 1];

      const nextValue = curve[currentCardIndex] ?? fallback;

      setStressLevel(nextValue);

    }

  }, [phase, currentCardIndex]);



  // Handle card flip
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Handle next card
  const handleNext = useCallback(() => {
    const isLastCard = currentCardIndex === flipCardsData.length - 1;

    if (isLastCard) {
      // Transition to next phase
      if (phase === "dor") {
        setPhase("colapso");
      } else if (phase === "bora") {
        setPhase("comparison");
      }
    } else {
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false); // Reset flip state
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentCardIndex, phase]);

  // Handle colapso complete
  const handleColapsoComplete = useCallback(() => {
    setPhase("transicao");
  }, []);

  // Handle transicao complete
  const handleTransicaoComplete = useCallback(() => {
    setPhase("bora");
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, []);

  // Handle comparison complete
  const handleComparisonComplete = useCallback(() => {
    navigate("/offer");
  }, [navigate]);

  // Render COLAPSO phase
  if (phase === "colapso") {
    return <ColapsoScreen onContinue={handleColapsoComplete} />;
  }

  // Render TRANSICAO phase
  if (phase === "transicao") {
    return <TransicaoScreen onContinue={handleTransicaoComplete} />;
  }

  // Render COMPARISON phase
  if (phase === "comparison") {
    return <TwoPathsComparison onContinue={handleComparisonComplete} />;
  }

  // Get current card data and content
  const currentCard = flipCardsData[currentCardIndex];
  const cardContent = getCardContent(currentCard, phase as "dor" | "bora");
  const isDorPhase = phase === "dor";
  const isLastCard = currentCardIndex === flipCardsData.length - 1;
  const stressStatus = getStressStatus(stressLevel, phase);
  const progressPercent = Math.min(((currentCardIndex + 1) / flipCardsData.length) * 100, 100);

  return (
    <div className="min-h-screen bg-background relative">
      {/* StressBar - sticky at top */}
      <StressBar
        stressLevel={stressLevel}
        phase={phase}
        visible={true}
      />

      {/* Main content */}
      <div className="pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
          {/* Phase indicator */}
          <motion.div
            className="w-full text-center flex flex-col items-center space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm font-semibold ${stressStatus.bgColor} ${stressStatus.borderColor} ${stressStatus.textColor}`}
            >
              <span>
                {isDorPhase ? "Seu Dia Atual" : "Seu Novo Dia"}
              </span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full max-w-xs h-2 bg-muted/40 border border-border/60 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${stressStatus.color}`}
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{currentCardIndex + 1}/{flipCardsData.length}</span>
              <span className={stressStatus.textColor}>{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Card Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${currentCardIndex}`}
              className="flex justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FlipCard
                content={cardContent}
                phase={phase as "dor" | "bora"}
                isFlipped={isFlipped}
                onFlip={handleFlip}
                onNext={handleNext}
                isLastCard={isLastCard}
              />
            </motion.div>
          </AnimatePresence>

          {/* Phase hints - only on first card */}
          {currentCardIndex === 0 && (
            <motion.div
              className={`rounded-xl p-3 sm:p-4 text-center border ${stressStatus.borderColor} ${stressStatus.bgColor}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className={`text-xs sm:text-sm ${stressStatus.textColor}`}>
                {isDorPhase
                  ? "💡 Estes são os 8 momentos do seu dia. Toque no card para ver os detalhes de cada momento."
                  : "✨ Agora veja como seria seu dia com o Sistema BORA. Mesmos momentos, escolhas diferentes."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMirror;
