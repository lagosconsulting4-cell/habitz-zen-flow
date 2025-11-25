import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const questions = [
  {
    id: 1,
    question: "🎯 Quão difícil é criar uma rotina que realmente funciona?",
    options: [
      "Impossível — sempre desisto",
      "Começo empolgado, mas perco o ritmo em dias",
      "Às vezes consigo manter, mas não é consistente",
      "Consigo seguir com disciplina"
    ]
  },
  {
    id: 2,
    question: "💭 O que você sente ao ver alguém evoluindo enquanto você está parado?",
    options: [
      "Frustração profunda — sinto que fiquei pra trás",
      "Inveja disfarçada de motivação",
      "Indiferença — cada um no seu tempo",
      "Inspiração real — quero fazer igual"
    ]
  },
  {
    id: 3,
    question: "🔁 Quantas vezes você prometeu a si mesmo que ia mudar... e não mudou?",
    options: [
      "Perdí a conta — virou piada interna",
      "Umas 5 a 10 vezes só esse ano",
      "Algumas vezes, mas tento não pensar nisso",
      "Raramente prometo, prefiro agir"
    ]
  },
  {
    id: 4,
    question: "😔 Qual dessas frases mais dói quando você pensa nela?",
    options: [
      "\"Estou estagnado e cansado de mim mesmo\"",
      "\"Sinto que o tempo tá passando e eu não saí do lugar\"",
      "\"Não sei nem por onde começar\"",
      "\"Estou fazendo meu melhor e crescendo\""
    ]
  },
  {
    id: 5,
    question: "🚧 O que realmente te impede de viver como você quer?",
    options: [
      "Falta de disciplina — sempre deixo pra depois",
      "Paralisia — não sei por onde começar",
      "Falta de tempo — minha rotina é caótica",
      "Nada — estou construindo meu caminho"
    ]
  },
  {
    id: 6,
    question: "📊 Quando você cria uma meta, o que geralmente acontece?",
    options: [
      "Desisto em 2 semanas ou menos",
      "Começo bem, mas perco a energia rápido",
      "Mantenho algumas metas, outras caem no esquecimento",
      "Geralmente atinjo o que estabeleço"
    ]
  },
  {
    id: 7,
    question: "💬 Qual pensamento mais aparece na sua mente ultimamente?",
    options: [
      "\"Segunda eu começo...\" (mas nunca começa)",
      "\"Mais um dia que eu desperdicei\"",
      "\"Por que diabos eu não consigo mudar?\"",
      "\"Estou evoluindo, um passo de cada vez\""
    ]
  },
  {
    id: 8,
    question: "⚡ Como anda sua energia durante o dia?",
    options: [
      "Sempre exausto, vivo no piloto automático",
      "Minha energia despenca do nada — muito instável",
      "Razoável, mas podia ser bem melhor",
      "Acordo disposto e mantenho o ritmo"
    ]
  },
  {
    id: 9,
    question: "🌱 Olhando pro último ano, você sente que evoluiu de verdade?",
    options: [
      "Não. Estou no mesmo lugar (ou pior)",
      "Quase nada — mudou pouca coisa",
      "Evoluí um pouco, mas muito devagar",
      "Sim, vejo progresso real"
    ]
  },
  {
    id: 10,
    question: "🔮 Se você continuar exatamente como está hoje, onde vai estar daqui a 1 ano?",
    options: [
      "No mesmo lugar — mais velho, mais arrependido",
      "Provavelmente igual... ou até pior",
      "Talvez diferente, mas não tenho certeza",
      "Em outro nível — estou construindo meu futuro agora"
    ]
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showMidFeedback, setShowMidFeedback] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion === 4 && !showMidFeedback) {
      setShowMidFeedback(true);
      return;
    }

    if (showMidFeedback) {
      setShowMidFeedback(false);
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate("/mirror");
    }
  };

  if (showMidFeedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-6 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-accent rounded-full mx-auto flex items-center justify-center animate-pulse">
              <span className="text-3xl">💚</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              A gente entende.
              <span className="block text-accent mt-2">Você não está sozinho nisso.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Mais de 5.000 pessoas já sentiram essa mesma dor… e conseguiram virar o jogo com uma rotina de menos de 7 minutos por dia.
            </p>
            <Button 
              onClick={() => {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX');
                audio.play().catch(() => {});
                handleNext();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all px-8 py-6 text-lg mt-8"
            >
              Continuar →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full px-6 pt-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Pergunta {currentQuestion + 1} de {questions.length}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-500">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            {currentQ.question}
          </h2>

          <RadioGroup
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-accent hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX');
                  audio.play().catch(() => {});
                  handleAnswer(option);
                }}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="text-lg cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={() => {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX');
              audio.play().catch(() => {});
              handleNext();
            }}
            disabled={!hasAnswer}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all py-6 text-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {currentQuestion === questions.length - 1 ? "Ver meu resultado 🎯" : "Próxima →"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
