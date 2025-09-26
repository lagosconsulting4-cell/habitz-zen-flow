import { useState } from "react";

import ExpandableCards, { type Card } from "@/components/smoothui/ui/ExpandableCards";
import { Button } from "@/components/ui/button";

const cards: Card[] = [
  {
    id: 1,
    title: "Crie e organize seus hábitos com lembretes diários",
    image: "https://i.ibb.co/fVgGDsrB/14.png",
    content:
      "Defina metas claras, categorias e lembretes inteligentes para não esquecer do que importa. Visualize o progresso em tempo real e ajuste seus hábitos em poucos toques.",
    author: {
      name: "Planner diário",
      role: "Sua central de hábitos",
      image: "https://i.ibb.co/9kBTkx0b/Habitz-branco.webp",
    },
  },
  {
    id: 2,
    title: "Receba frases motivacionais fortes, todos os dias",
    image: "https://i.ibb.co/m5g6Qg4P/13.png",
    content:
      "Mensagens diretas para manter a disciplina. Escolhemos frases certeiras para relembrar por que você começou, nos momentos em que a energia cai.",
    author: {
      name: "Motivação diária",
      role: "Com curadoria Habitz",
      image: "https://i.ibb.co/9kBTkx0b/Habitz-branco.webp",
    },
  },
  {
    id: 3,
    title: "Use técnicas simples de meditação e respiração",
    image: "https://i.ibb.co/27x6X1rS/12.png",
    content:
      "Áudios curtos e exercícios guiados para baixar a ansiedade, focar e dormir melhor. Escolha práticas de 3 a 10 minutos conforme seu tempo.",
    author: {
      name: "Sessões guiadas",
      role: "Respiração, foco e calma",
      image: "https://i.ibb.co/9kBTkx0b/Habitz-branco.webp",
    },
  },
  {
    id: 4,
    title: "Acesse dicas de rotina, leitura, dieta e foco",
    image: "https://i.ibb.co/Cp88gGht/11.png",
    content:
      "Conteúdo objetivo sobre performance, saúde, leitura e produtividade. Nada de teoria sem aplicação — só o essencial para colocar em prática hoje.",
    author: {
      name: "Kit de evolução",
      role: "Rotina, leitura, dieta e foco",
      image: "https://i.ibb.co/9kBTkx0b/Habitz-branco.webp",
    },
  },
  {
    id: 5,
    title: "Siga o Modo Guiado: uma jornada de 4 semanas",
    image: "https://i.ibb.co/vCWMCwCc/jornada.webp",
    content:
      "Um passo por dia para sair do piloto automático. Cada tarefa concluída libera o próximo dia, com travas visuais, barra de progresso e reforço positivo.",
    author: {
      name: "Modo Guiado",
      role: "4 semanas para resetar sua rotina",
      image: "https://i.ibb.co/9kBTkx0b/Habitz-branco.webp",
    },
  },
];

export type UnlockedSectionProps = {
  onCardSelect?: (card: Card, state: "open" | "close") => void;
  onCtaClick: () => void;
  track?: (event: string, meta?: Record<string, unknown>) => void;
};

const UnlockedSection = ({ onCardSelect, onCtaClick, track }: UnlockedSectionProps) => {
  const [selected, setSelected] = useState<number | null>(cards[0].id);

  const handleSelect = (id: number) => {
    setSelected((previous) => {
      if (previous === id) {
        const card = cards.find((item) => item.id === id);
        if (card) {
          onCardSelect?.(card, "close");
          track?.("landing_expandable_card_close", { id: card.id, title: card.title });
        }
        return null;
      }

      const card = cards.find((item) => item.id === id);
      if (card) {
        onCardSelect?.(card, "open");
        track?.("landing_expandable_card_open", { id: card.id, title: card.title });
      }

      return id;
    });
  };

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

        <ExpandableCards cards={cards} selectedCard={selected} onSelect={handleSelect} />

        <div className="fade-in animate-delay-200 mt-12 flex justify-center">
          <Button
            size="lg"
            onClick={onCtaClick}
            className="h-14 rounded-2xl bg-gray-900 px-8 text-base font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Quero tudo agora por R$ 47,90
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UnlockedSection;