import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const testimonials = [
  {
    name: "Lucas Mendes",
    age: 28,
    role: "Designer",
    before: "Vivia prometendo começar e nunca conseguia.",
    after: "O BORA foi o único que me fez manter uma rotina sem me sentir sobrecarregado.",
    avatar: "👨‍💼"
  },
  {
    name: "Mariana Costa",
    age: 24,
    role: "Estudante",
    before: "Acordava sem propósito e dormia frustrada.",
    after: "Em 7 dias, já tava dormindo melhor e focando mais.",
    avatar: "👩‍🎓"
  },
  {
    name: "Rafael Silva",
    age: 32,
    role: "Empreendedor",
    before: "Sentia que estava estagnado há anos.",
    after: "Finalmente tenho clareza do que fazer todos os dias. Virei o jogo.",
    avatar: "👨‍💻"
  }
];

const routineItems = [
  { icon: "☀️", text: "Acordar com propósito e energia" },
  { icon: "🎯", text: "3 hábitos de alto impacto" },
  { icon: "⚡", text: "Foco absoluto durante o dia" },
  { icon: "🌙", text: "Reflexão e encerramento consciente" }
];

const benefits = [
  { icon: "🎯", text: "Rotina sob medida pro seu objetivo real" },
  { icon: "✅", text: "Checklists diários simples e práticos" },
  { icon: "📊", text: "Acompanhamento visual de progresso" },
  { icon: "🚀", text: "Transformação sem teoria — só execução" }
];

const Offer = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-in fade-in duration-700">
          <div className="inline-block bg-accent/10 px-6 py-2 rounded-full">
            <span className="text-accent font-semibold">Sua rotina está pronta</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Em menos de 7 minutos por dia,
            <span className="block text-accent mt-2">você vira o jogo 🎯</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Baseado nas suas respostas, montamos um plano personalizado para você <strong className="text-foreground">sair da estagnação</strong> e criar <strong className="text-foreground">consistência real</strong>.
          </p>
        </div>

        {/* Routine Preview */}
        <div className="bg-secondary/30 rounded-3xl p-8 md:p-12 space-y-6 shadow-medium animate-in fade-in duration-700">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            🗓️ Sua rotina personalizada
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {routineItems.map((item, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-xl border-2 border-border hover:border-accent hover:scale-105 transition-all animate-in fade-in duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{item.icon}</div>
                  <span className="text-lg font-semibold">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground pt-4">
            ⏱️ Cada passo leva menos de 2 minutos
          </p>
        </div>

        {/* Testimonials */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            💬 Quem já virou o jogo
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-secondary/20 p-6 rounded-2xl space-y-4 border border-border hover:border-accent hover:scale-105 transition-all animate-in fade-in duration-700"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-bold text-lg">{testimonial.name}, {testimonial.age}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-semibold">❌ Antes:</span> {testimonial.before}
                  </p>
                  <p className="font-semibold text-accent">
                    ✅ "{testimonial.after}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 space-y-8 animate-in fade-in duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            ✨ O que você vai ter no BORA
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 hover:scale-105 transition-all">
                <div className="text-2xl">{benefit.icon}</div>
                <span className="text-lg">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-8 py-12 animate-in fade-in duration-700">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Sua nova rotina está pronta
              <span className="block mt-2 text-accent">para começar agora. 🚀</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desbloqueie o acesso ao BORA e <strong className="text-foreground">vire o jogo</strong> em menos de 7 minutos por dia.
            </p>
          </div>

          <Button
            onClick={() => {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PWKzn7aVXFAxTqOXzu2sfBTCA0fTRfi4GIG/B7uSaRw0QWrTn7aRXFAxRqOPyu2wcBi+A0vPSgDEGH2/B7uOaSQ0PXLbn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVXEw1Sp+Xyu2sfBzGA0fPSgDEGH2/B7uOaSQ0QXLXn7aVX');
              audio.play().catch(() => {});
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all px-12 py-8 text-2xl rounded-2xl border-4 border-accent shadow-lg hover:shadow-xl w-full md:w-auto"
          >
            <span className="mr-3">🔓 Desbloquear agora</span>
            <span className="text-accent">✨</span>
          </Button>

          <p className="text-sm text-muted-foreground">
            ✅ Junte-se a mais de 5.000 pessoas que já transformaram suas vidas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offer;
