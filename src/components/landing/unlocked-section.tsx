import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const cards = [
  {
    id: 1,
    title: "Crie e organize seus hábitos com lembretes diários",
    image: "https://i.ibb.co/fVgGDsrB/14.png",
    content:
      "Defina metas claras, categorias e lembretes inteligentes para não esquecer do que importa. Visualize o progresso em tempo real e ajuste seus hábitos em poucos toques.",
    highlight: "Planner diário",
  },
  {
    id: 2,
    title: "Receba frases motivacionais fortes, todos os dias",
    image: "https://i.ibb.co/m5g6Qg4P/13.png",
    content:
      "Mensagens diretas para manter a disciplina. Selecionamos frases certeiras para relembrar por que você começou, nos momentos em que a energia cai.",
    highlight: "Motivação diária",
  },
  {
    id: 3,
    title: "Use técnicas simples de meditação e respiração",
    image: "https://i.ibb.co/27x6X1rS/12.png",
    content:
      "Áudios curtos e exercícios guiados para baixar a ansiedade, focar e dormir melhor. Escolha práticas de 3 a 10 minutos conforme o seu tempo.",
    highlight: "Sessões guiadas",
  },
  {
    id: 4,
    title: "Acesse dicas de rotina, leitura, dieta e foco",
    image: "https://i.ibb.co/Cp88gGht/11.png",
    content:
      "Conteúdo objetivo sobre performance, saúde, leitura e produtividade. Nada de teoria infinita — só o essencial para colocar em prática hoje.",
    highlight: "Kit de evolução",
  },
  {
    id: 5,
    title: "Siga o Modo Guiado: uma jornada de 4 semanas",
    image: "https://i.ibb.co/vCWMCwCc/jornada.webp",
    content:
      "Um passo por dia para sair do piloto automático. Cada tarefa concluída libera o próximo dia, com travas visuais, barra de progresso e reforço positivo.",
    highlight: "Modo Guiado",
  },
] as const;

export type UnlockedSectionProps = {
  onCardSelect?: (card: (typeof cards)[number], state: "open" | "close") => void;
  onCtaClick: () => void;
  track?: (event: string, meta?: Record<string, unknown>) => void;
};

const UnlockedSection = ({ onCardSelect, onCtaClick, track }: UnlockedSectionProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const handleSelect = () => {
      const index = carouselApi.selectedScrollSnap();
      setActiveIndex(index);
      const card = cards[index];
      if (card) {
        track?.("landing_feature_slide", { id: card.id, title: card.title });
        onCardSelect?.(card, "open");
      }
    };

    handleSelect();
    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi, track, onCardSelect]);

  return (
    <section id="recursos" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="fade-in mx-auto mb-16 max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
            Tudo destravado
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Comece agora com tudo destravado
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-gray-600">
            Visual, leve e direto. Cada card mostra uma parte do Habitz que trabalha junto para manter você em movimento.
          </p>
        </div>

        <div className="relative">
          <Carousel className="mx-auto max-w-6xl" opts={{ align: "start" }} setApi={setCarouselApi}>
            <CarouselContent>
              {cards.map((card) => (
                <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full overflow-hidden border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <CardHeader className="space-y-4 p-6">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded-3xl border border-slate-200 object-cover shadow-sm"
                  />
                </CardHeader>
                    <CardContent className="space-y-3 px-6 pb-8">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        {card.highlight}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600">{card.content}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex" />
            <CarouselNext className="hidden lg:flex" />
          </Carousel>

          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => carouselApi?.scrollTo(index)}
                className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-emerald-600" : "bg-slate-300"}`}
                aria-label={`Ir para ${card.title}`}
              />
            ))}
          </div>
        </div>

        <div className="fade-in animate-delay-200 mt-12 flex justify-center">
          <Button
            size="lg"
            onClick={onCtaClick}
            className="h-14 rounded-2xl bg-gray-900 px-8 text-base font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Quero acessar o Habitz agora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UnlockedSection;


