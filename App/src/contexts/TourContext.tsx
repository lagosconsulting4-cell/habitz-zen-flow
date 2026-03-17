import { createContext, useContext, useState, type ReactNode } from "react";
import { TOUR_STEPS } from "@/config/tourSteps";

// ============================================================================
// TYPES
// ============================================================================

interface TourContextValue {
  isTourActive: boolean;
  currentStep: number;   // 0-based
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  endTour: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TourContext = createContext<TourContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = () => {
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      setIsTourActive(false);
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const endTour = () => {
    setIsTourActive(false);
  };

  return (
    <TourContext.Provider value={{ isTourActive, currentStep, totalSteps: TOUR_STEPS.length, startTour, nextStep, endTour }}>
      {children}
    </TourContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTour = (): TourContextValue => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
};
