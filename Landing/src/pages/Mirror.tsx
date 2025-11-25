import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const scenarios = [
  {
    time: "07:00",
    emoji: "😴",
    title: "Mais um dia igual",
    description: "Acordou cansado. Pegou o celular antes de levantar. 40 minutos já se passaram e você nem saiu da cama.",
    emotion: "Culpa"
  },
  {
    time: "12:30",
    emoji: "😩",
    title: "Almoço e procrastinação",
    description: "Prometeu começar depois do almoço. Está rolando o feed há 30 minutos enquanto a tarde escapa.",
    emotion: "Frustração"
  },
  {
    time: "18:00",
    emoji: "😞",
    title: "Final do dia",
    description: "Olha pra trás e percebe: mais um dia perdido sem fazer o que realmente importa. De novo.",
    emotion: "Decepção profunda"
  },
  {
    time: "23:00",
    emoji: "😔",
    title: "Antes de dormir",
    description: "\"Amanhã vai ser diferente\", você pensa. Mas lá no fundo, sabe que não será. Nunca é.",
    emotion: "Sensação de estar ficando pra trás"
  }
];

const Mirror = () => {
  const navigate = useNavigate();
  const [currentScene, setCurrentScene] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    if (currentScene < scenarios.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      setShowModal(true);
    }
  };

  if (showModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <div className="text-center space-y-8 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-accent rounded-full mx-auto flex items-center justify-center animate-pulse">
              <span className="text-4xl">✨</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              💡 E se pudesse ser diferente?
            </h2>
            
            <div className="bg-secondary/50 p-8 rounded-2xl space-y-4 text-left hover:scale-105 transition-all">
              <p className="text-xl font-semibold">
                Baseado nas suas respostas, criamos uma <span className="text-accent">rotina sob medida</span> que resolve exatamente os bloqueios que você enfrenta hoje.
              </p>
              <p className="text-lg text-muted-foreground">
                ⏱️ <span className="text-accent font-bold">Menos de 7 minutos por dia.</span> 🎯 100% adaptada pra sua vida real.
              </p>
            </div>

            <Button
              onClick={() => {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX');
                audio.play().catch(() => {});
                navigate("/offer");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all px-10 py-7 text-xl mt-8 w-full md:w-auto"
            >
              <span className="mr-2">✨ Ver minha rotina personalizada</span>
              <span className="text-accent">→</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const scene = scenarios[currentScene];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-12">
        <div className="text-center animate-in fade-in duration-700">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🪞 Espelho do Futuro
          </h1>
          <p className="text-muted-foreground">
            Um dia típico se nada mudar... 😔
          </p>
        </div>

        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{scene.emoji}</div>
            <div className="text-5xl font-bold text-accent">
              {scene.time}
            </div>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              {scene.title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {scene.description}
            </p>
          </div>

          <div className="bg-destructive/5 border-l-4 border-destructive p-6 rounded-lg hover:scale-105 transition-all">
            <p className="text-sm text-muted-foreground mb-1">Como você se sente:</p>
            <p className="text-lg font-semibold text-destructive">
              💔 {scene.emotion}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <div className="flex gap-2">
            {scenarios.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentScene
                    ? "w-12 bg-accent"
                    : index < currentScene
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6"
          >
            {currentScene === scenarios.length - 1 ? "Próximo" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Mirror;
