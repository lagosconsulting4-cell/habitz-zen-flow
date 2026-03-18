import { memo } from "react";
import { useOnboardingNav } from "../OnboardingProviderV2";
import { MockNavigationBar } from "../TourMockElements";
import { SpotlightOverlay } from "../SpotlightOverlay";

export const S15TourToday = memo(function S15TourToday() {
  const { nextStep } = useOnboardingNav();

  return (
    <div className="h-full relative">
      <MockNavigationBar activeTab="home" />
      <SpotlightOverlay
        targetSelector='[data-tour="today"]'
        title="Aqui começa o dia."
        copy="Todos os seus hábitos do dia ficam aqui. Um toque para marcar como feito. Simples assim."
        position="top"
        stepIndex={0}
        totalSteps={5}
        onNext={nextStep}
      />
    </div>
  );
});
