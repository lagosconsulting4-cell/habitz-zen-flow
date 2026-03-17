import { useOnboardingV2 } from "../OnboardingProviderV2";
import { MockProfileSection } from "../TourMockElements";
import { SpotlightOverlay } from "../SpotlightOverlay";

export const S18TourAvatar = () => {
  const { nextStep } = useOnboardingV2();

  return (
    <div className="h-full relative">
      <MockProfileSection highlightTarget="avatar" />
      <SpotlightOverlay
        targetSelector='[data-tour="avatar"]'
        title="Você evolui de verdade aqui."
        copy="A cada hábito completado, seu avatar avança. É uma forma de ver, de forma visual, quem você está se tornando."
        position="bottom"
        stepIndex={3}
        totalSteps={5}
        onNext={nextStep}
      />
    </div>
  );
};
