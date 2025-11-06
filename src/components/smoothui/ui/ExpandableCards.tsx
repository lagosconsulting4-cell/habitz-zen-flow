import { type HTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type CardAuthor = {
  name: string;
  role?: string;
  image?: string;
};

export type Card = {
  id: number;
  title: string;
  image: string;
  content: string;
  author?: CardAuthor;
};

export interface ExpandableCardsProps extends HTMLAttributes<HTMLDivElement> {
  cards: Card[];
  selectedCard: number | null;
  onSelect: (id: number) => void;
}

const transition = { duration: 0.24, ease: [0.4, 0, 0.2, 1] } as const;

const imageVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.04 },
};

const contentVariants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: { opacity: 1, height: "auto" },
};

const ringVariants = {
  inactive: { opacity: 0 },
  active: { opacity: 1 },
};

const ExpandableCards = ({ cards, selectedCard, onSelect, className, ...props }: ExpandableCardsProps) => {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 xl:grid-cols-3", className)} {...props}>
      {cards.map((card) => {
        const isSelected = card.id === selectedCard;

        return (
          <motion.article
            key={card.id}
            layout
            transition={transition}
            role="button"
            tabIndex={0}
            aria-expanded={isSelected}
            onClick={() => onSelect(card.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(card.id);
              }
            }}
            className={cn(
              "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 focus:outline-none",
              isSelected ? "shadow-[0_20px_60px_rgba(15,23,42,0.12)]" : "hover:shadow-[0_16px_44px_rgba(15,23,42,0.08)]",
            )}
          >
            <motion.div
              className="relative overflow-hidden"
              whileHover="hover"
              animate="idle"
              initial="idle"
              variants={imageVariants}
              transition={transition}
            >
              <motion.img
                src={card.image}
                alt={card.title}
                loading="lazy"
                decoding="async"
                className="h-56 w-full object-cover"
                variants={imageVariants}
                transition={transition}
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-t-3xl border-2 border-emerald-400/80"
                variants={ringVariants}
                animate={isSelected ? "active" : "inactive"}
                transition={transition}
              />
            </motion.div>

            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold leading-tight text-slate-900">{card.title}</h3>
                <ChevronDown
                  className={cn(
                    "mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300",
                    isSelected && "rotate-180 text-slate-600",
                  )}
                />
              </div>

              <AnimatePresence initial={false}>
                {isSelected ? (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={contentVariants}
                    transition={transition}
                    className="space-y-4 text-sm text-slate-600"
                  >
                    <p className="leading-relaxed text-slate-600">{card.content}</p>
                    {card.author ? (
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                        {card.author.image ? (
                          <img
                            src={card.author.image}
                            alt={card.author.name}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : null}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{card.author.name}</span>
                          {card.author.role ? (
                            <span className="text-xs text-slate-500">{card.author.role}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                ) : (
                  <div className="text-sm text-slate-500">
                    <p className="line-clamp-2 leading-relaxed">{card.content}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};

export default ExpandableCards;