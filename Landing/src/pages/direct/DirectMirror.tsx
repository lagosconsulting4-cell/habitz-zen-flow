import React, { useState, useCallback, useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence } from "motion/react";
import StressBar from "@/components/direct/StressBar";
import FlipCard, { flipCardsData, getCardContent } from "@/components/direct/FlipCard";
import ColapsoScreen from "@/components/direct/ColapsoScreen";
import TransicaoScreen from "@/components/direct/TransicaoScreen";
import TwoPathsComparison from "@/components/direct/TwoPathsComparison";

// Mirror phases state machine
type MirrorPhase = "dor" | "colapso" | "transicao" | "bora" | "comparison";

const DirectMirror = () => {
  const navigate = usePathAwareNavigate();

  // State
  const [phase, setPhase] = useState<MirrorPhase>("dor");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stressLevel, setStressLevel] = useState(78); // Starts at quiz result (78%)

  // Scroll to top on mount - using requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }, []);

  // Calculate stress based on phase and cards
  useEffect(() => {
    if (phase === "dor") {
      // DOR phase: accumulate stress as user progresses through cards
      const baseStress = 78;
      const stressPerCard = 9;
      const calculatedStress = baseStress + (currentCardIndex * stressPerCard);
      setStressLevel(Math.min(calculatedStress, 150));
    } else if (phase === "bora") {
      // BORA phase: reduce stress as user progresses through cards
      const startStress = 150;
      const stressReduction = 17.25;
      const calculatedStress = startStress - (currentCardIndex * stressReduction);
      setStressLevel(Math.max(calculatedStress, 12));
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

  // Progress dots
  const progressDots = Array.from({ length: flipCardsData.length }, (_, i) => i);

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
        <div className="max-w-md mx-auto space-y-6">
          {/* Phase indicator */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border ${
              isDorPhase
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}>
              <span className="font-semibold text-sm">
                {isDorPhase ? "Seu Dia Atual" : "Seu Novo Dia"}
              </span>
            </div>
          </motion.div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {progressDots.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentCardIndex
                    ? isDorPhase
                      ? "w-6 bg-red-400"
                      : "w-6 bg-green-400"
                    : index < currentCardIndex
                    ? isDorPhase
                      ? "bg-red-400/60"
                      : "bg-green-400/60"
                    : "bg-muted"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === currentCardIndex ? 1 : 0.8 }}
              />
            ))}
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
              className={`rounded-xl p-3 sm:p-4 text-center border ${
                isDorPhase
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-green-500/10 border-green-500/20"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className={`text-xs sm:text-sm ${isDorPhase ? "text-red-400" : "text-green-400"}`}>
                {isDorPhase
                  ? "💡 Estes são os 8 momentos do seu dia. Toque no card para ver os detalhes de cada momento."
                  : "✨ Agora veja como seria seu dia com o Sistema BORA. Mesmos momentos, escolhas diferentes."}
              </p>
            </motion.div>
          )}

          {/* Current stress indicator */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isDorPhase
                ? "bg-red-500/10 text-red-400"
                : "bg-green-500/10 text-green-400"
            }`}>
              <span>{isDorPhase ? "📈" : "📉"}</span>
              <span>
                Nível de estresse: <strong>{Math.round(stressLevel)}%</strong>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DirectMirror;
