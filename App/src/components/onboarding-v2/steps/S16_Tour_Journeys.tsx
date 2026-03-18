import { memo } from "react";
import { useOnboardingNav } from "../OnboardingProviderV2";
import { MockNavigationBar } from "../TourMockElements";
import { SpotlightOverlay } from "../SpotlightOverlay";

export const S16TourJourneys = memo(function S16TourJourneys() {
  const { nextStep } = useOnboardingNav();

  return (
    <div className="h-full relative">
      <MockNavigationBar activeTab="journeys" />
      <SpotlightOverlay
        targetSelector='[data-tour="journeys"]'
        title="Sua missão de 30 dias."
        copy="Cada dia da sua jornada tem hábitos específicos esperando por você. É aqui que você acompanha o progresso."
        position="top"
        stepIndex={1}
        totalSteps={5}
        onNext={nextStep}
      />
    </div>
  );
});
