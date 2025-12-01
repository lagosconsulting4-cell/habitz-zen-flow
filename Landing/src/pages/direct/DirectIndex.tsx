import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Data imports
import { QUIZ_STEPS, getTotalSteps, type QuizStep } from './data/quizSteps';
import { LOGO } from './constants/assetPaths';

// Component imports (to be created in later phases)
// import QuizQuestion from './components/QuizQuestion';
// import QuizMessage from './components/QuizMessage';
// import QuizCarousel from './components/QuizCarousel';
// import QuizLoading from './components/QuizLoading';
// import QuizProfile from './components/QuizProfile';
// import QuizOffer from './components/QuizOffer';

const DirectIndex: React.FC = () => {
  // State machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentStep = QUIZ_STEPS[currentStepIndex];
  const totalSteps = getTotalSteps();

  // Navigation handlers
  const goToNextStep = (answer?: string) => {
    if (answer && currentStep.type === 'question') {
      setAnswers(prev => ({
        ...prev,
        [currentStep.id]: answer,
      }));
    }

    if (currentStepIndex < totalSteps - 1) {
      setDirection('forward');
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setDirection('backward');
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  // Temporary render function (will be replaced by actual components)
  const renderStepContent = (step: QuizStep) => {
    switch (step.type) {
      case 'question':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>
            {step.description && (
              <p className="text-center text-muted-foreground">{step.description}</p>
            )}

            {step.image && (
              <div className="flex justify-center">
                <img
                  src={step.image}
                  alt="Ilustração"
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="space-y-3">
              {step.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => goToNextStep(option.text)}
                  className="w-full px-6 py-4 text-left bg-white border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  {option.emoji && <span className="mr-2">{option.emoji}</span>}
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            {step.description && (
              <p className="text-muted-foreground whitespace-pre-line">{step.description}</p>
            )}

            {step.image && (
              <div className="flex justify-center">
                <img
                  src={step.image}
                  alt="Ilustração"
                  className="max-w-sm rounded-lg shadow-md"
                />
              </div>
            )}

            {step.images && (
              <div className="flex justify-center gap-4">
                {step.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ilustração ${idx + 1}`}
                    className="max-w-[45%] rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => goToNextStep()}
              className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {step.buttonText || 'Continuar'}
            </button>
          </div>
        );

      case 'carousel':
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            {step.description && (
              <p className="text-muted-foreground">{step.description}</p>
            )}

            <div className="bg-gray-100 rounded-lg p-8">
              <p className="text-gray-500">[Carousel Component - To be implemented]</p>
              <p className="text-sm mt-2">Images: {step.carousel?.images.length}</p>
            </div>

            <button
              onClick={() => goToNextStep()}
              className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {step.buttonText || 'Continuar'}
            </button>
          </div>
        );

      case 'loading':
        return (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            {step.description && (
              <p className="text-muted-foreground">{step.description}</p>
            )}

            <div className="bg-gray-100 rounded-lg p-8">
              <p className="text-gray-500">[Loading Component - To be implemented]</p>
              <p className="text-sm mt-2">With progress animation and audio player</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">{step.title}</h2>

            <div className="bg-gray-100 rounded-lg p-8">
              <p className="text-gray-500 text-center">[Profile Component - To be implemented]</p>
              <p className="text-sm mt-2 text-center">TDAH Type: {step.tdahType}</p>
              <p className="text-sm text-center">Metrics: {step.metrics?.length}</p>
            </div>

            <button
              onClick={() => goToNextStep()}
              className="w-full px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {step.buttonText || 'Continuar'}
            </button>
          </div>
        );

      case 'offer':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center whitespace-pre-line">{step.title}</h2>

            <div className="bg-gray-100 rounded-lg p-8">
              <p className="text-gray-500 text-center">[Offer Component - To be implemented]</p>
              <p className="text-sm mt-2 text-center">Before/After, Modules Carousel, FAQ, Timers</p>
            </div>
          </div>
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={LOGO} alt="Logo TDAH" className="h-16" />
        </div>

        {/* Back Button */}
        {currentStepIndex > 0 && (
          <button
            onClick={goToPreviousStep}
            className="mb-4 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2"
            aria-label="Voltar"
          >
            ← Voltar
          </button>
        )}

        {/* Progress Bar */}
        {currentStep.progress !== undefined && (
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-teal-600"
                initial={{ width: 0 }}
                animate={{ width: `${currentStep.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Step Content with Animation */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(currentStep)}
          </motion.div>
        </AnimatePresence>

        {/* Debug Info (remove in production) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <p>Step: {currentStepIndex + 1} / {totalSteps}</p>
            <p>Type: {currentStep.type}</p>
            <p>Answers: {Object.keys(answers).length}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DirectIndex;
