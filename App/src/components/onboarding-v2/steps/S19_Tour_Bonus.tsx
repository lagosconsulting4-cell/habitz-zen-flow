import { memo } from "react";
import { useOnboardingNav } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { MockProfileSection } from "../TourMockElements";
import { SpotlightOverlay } from "../SpotlightOverlay";

export const S19TourBonus = memo(function S19TourBonus() {
  const { nextStep } = useOnboardingNav();
  const { trackEvent } = useEventTracker();

  const handleNext = () => {
    trackEvent("onboarding_v2_tour_completed", {}, "onboarding_v2");
    nextStep();
  };

  return (
    <div className="h-full relative">
      <MockProfileSection highlightTarget="bonus" />
      <SpotlightOverlay
        targetSelector='[data-tour="bonus"]'
        title="Tem mais coisa aqui dentro."
        copy="Livros recomendados, meditações guiadas e conteúdos para quem quer ir além. Disponíveis sempre que você quiser."
        position="bottom"
        stepIndex={4}
        totalSteps={5}
        onNext={handleNext}
      />
    </div>
  );
});
