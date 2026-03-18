import { memo } from "react";
import { useOnboardingNav } from "../OnboardingProviderV2";
import { MockNavigationBar } from "../TourMockElements";
import { SpotlightOverlay } from "../SpotlightOverlay";

export const S17TourHabits = memo(function S17TourHabits() {
  const { nextStep } = useOnboardingNav();

  return (
    <div className="h-full relative">
      <MockNavigationBar activeTab="habits" />
      <SpotlightOverlay
        targetSelector='[data-tour="habits"]'
        title="A sua rotina, do seu jeito."
        copy="Adicione, edite ou reorganize seus hábitos quando quiser. A rotina é sua, o Bora só ajuda a manter."
        position="top"
        stepIndex={2}
        totalSteps={5}
        onNext={nextStep}
      />
    </div>
  );
});
