import { QuizProvider } from "@/components/quiz/QuizProvider";
import { QuizContent } from "@/components/quiz/QuizModal";

const BoraQuizPage = () => (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] text-slate-50 overflow-y-auto">
        <QuizProvider>
            <QuizContent />
        </QuizProvider>
    </div>
);

export default BoraQuizPage;
