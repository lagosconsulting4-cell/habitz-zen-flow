import React, { useState, useCallback, useEffect } from "react";
import { usePathAwareNavigate } from "@/contexts/PathPrefixContext";
import { motion, AnimatePresence } from "motion/react";
import StressBar from "@/components/direct/StressBar";
import FlipCard, { flipCardsData } from "@/components/direct/FlipCard";
import ColapsoScreen from "@/components/direct/ColapsoScreen";
import TransicaoScreen from "@/components/direct/TransicaoScreen";
import TwoPathsComparison from "@/components/direct/TwoPathsComparison";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

// Mirror phases state machine
type MirrorPhase = "dor" | "colapso" | "transicao" | "bora" | "comparison";

const DirectMirror = () => {
  const navigate = usePathAwareNavigate();

  // State
  const [phase, setPhase] = useState<MirrorPhase>("dor");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [stressLevel, setStressLevel] = useState(78); // Starts at quiz result (78%)

  // Calculate stress based on phase and cards
  useEffect(() => {
    if (phase === "dor") {
      // DOR phase: accumulate stress as user progresses through cards
      const baseStress = 78;
      const stressPerCard = 9; // Each card adds ~9% stress
      const calculatedStress = baseStress + (currentCardIndex * stressPerCard);
      setStressLevel(Math.min(calculatedStress, 150)); // Cap at 150%
    } else if (phase === "bora") {
      // BORA phase: reduce stress as user progresses through cards
      const startStress = 150;
      const stressReduction = 17.25; // Each card reduces ~17.25% stress
      const calculatedStress = startStress - (currentCardIndex * stressReduction);
      setStressLevel(Math.max(calculatedStress, 12)); // Floor at 12%
    }
  }, [phase, currentCardIndex]);

  // Handle card flip
  const handleCardFlip = useCallback((cardId: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));

    // Haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Handle next card in DOR phase
  const handleNextCard = useCallback(() => {
    if (currentCardIndex < flipCardsData.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // All DOR cards shown, trigger COLAPSO
      setPhase("colapso");
    }
  }, [currentCardIndex]);

  // Handle previous card
  const handlePreviousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentCardIndex]);

  // Handle colapso complete
  const handleColapsoComplete = useCallback(() => {
    setPhase("transicao");
  }, []);

  // Handle transicao complete
  const handleTransicaoComplete = useCallback(() => {
    setPhase("bora");
    setCurrentCardIndex(0);
    setFlippedCards({}); // Reset flipped state
  }, []);

  // Handle next card in BORA phase
  const handleNextCardBora = useCallback(() => {
    if (currentCardIndex < flipCardsData.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // All BORA cards shown, show comparison
      setPhase("comparison");
    }
  }, [currentCardIndex]);

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

  // Render DOR or BORA phases (card journey)
  const currentCard = flipCardsData[currentCardIndex];
  const isDorPhase = phase === "dor";
  const isBoraPhase = phase === "bora";
  const progress = ((currentCardIndex + 1) / flipCardsData.length) * 100;

  return (
    <div className="min-h-screen bg-background relative">
      {/* StressBar - sticky at top */}
      <StressBar
        stressLevel={stressLevel}
        phase={phase}
        visible={true}
      />

      {/* Main content - with padding for sticky bar */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Phase indicator */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              isDorPhase
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}>
              <span className="font-semibold text-sm">
                {isDorPhase ? "Caminho da DOR" : "Caminho BORA"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Momento {currentCardIndex + 1} de {flipCardsData.length}
            </p>
          </motion.div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso da Jornada</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isDorPhase
                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
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
                data={currentCard}
                isFlipped={isBoraPhase ? true : (flippedCards[currentCard.id] || false)}
                onFlip={() => handleCardFlip(currentCard.id)}
                autoFlip={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Card content description */}
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-foreground">
              {currentCard.title}
            </h3>
            {isDorPhase && (
              <p className="text-sm text-muted-foreground">
                {flippedCards[currentCard.id]
                  ? "Esta é a solução. Clique novamente para ver o problema."
                  : "Toque no card para ver a solução"}
              </p>
            )}
            {isBoraPhase && (
              <p className="text-sm text-green-400">
                Com pequenas mudanças, tudo muda.
              </p>
            )}
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {currentCardIndex > 0 && (
              <Button
                variant="outline"
                onClick={handlePreviousCard}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
            <Button
              onClick={isDorPhase ? handleNextCard : handleNextCardBora}
              className={`flex-1 ${
                isDorPhase
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500"
              } text-white`}
            >
              {currentCardIndex === flipCardsData.length - 1 ? (
                <>
                  {isDorPhase ? "Ver Colapso" : "Comparar Caminhos"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo Momento
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Phase-specific hints */}
          {isDorPhase && currentCardIndex === 0 && (
            <motion.div
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-red-400">
                💡 Estes são os 8 momentos do seu dia atual. Observe como cada escolha aumenta seu estresse.
              </p>
            </motion.div>
          )}

          {isBoraPhase && currentCardIndex === 0 && (
            <motion.div
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-green-400">
                ✨ Agora veja os mesmos 8 momentos, mas com o Sistema BORA. Pequenas mudanças, grande impacto.
              </p>
            </motion.div>
          )}

          {/* Stress change indicator */}
          {currentCardIndex > 0 && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isDorPhase
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}>
                {isDorPhase ? "↗" : "↘"} Estresse {isDorPhase ? "aumentando" : "diminuindo"}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMirror;
