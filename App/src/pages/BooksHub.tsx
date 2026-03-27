import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Star, Clock, ExternalLink, TrendingUp, Book } from "lucide-react";
import { useBooks } from "@/hooks/useSupabaseData";
import { isBonusEnabled } from "@/config/bonusFlags";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// Map book titles to local cover images
const BASE = import.meta.env.BASE_URL;
const COVER_MAP: Record<string, string> = {
  "Hábitos Atômicos": `${BASE}images/books/Hábitos Atômicos.jpg`,
  "Os 7 Hábitos de Pessoas Altamente Eficazes": `${BASE}images/books/Os 7 Hábitos de Pessoas Altamente Eficazes.webp`,
  "O Poder do Hábito": `${BASE}images/books/O Poder do Hábito.jpeg`,
  "Mindset": `${BASE}images/books/Mindset.jpg`,
  "A Psicologia do Dinheiro": `${BASE}images/books/A Psicologia do Dinheiro.jpeg`,
  "Ego é o Seu Inimigo": `${BASE}images/books/Ego é o Seu Inimigo.webp`,
  "Minimalismo Digital": `${BASE}images/books/Minimalismo Digital.jpg`,
  "Quem Pensa Enriquece": `${BASE}images/books/Quem Pensa Enriquece.jpg`,
  "O Sistema da Chave Mestra": `${BASE}images/books/O Sistema da Chave Mestra.webp`,
  "A Arte Sutil de Ligar o Foda-se": `${BASE}images/books/A Arte Sutil de Ligar o Foda-se.webp`,
  "A Arte Sutil de Ligar o F*da-se": `${BASE}images/books/A Arte Sutil de Ligar o Foda-se.webp`,
  "Como Fazer Amigos e Influenciar Pessoas": `${BASE}images/books/Como Fazer Amigos e Influenciar Pessoas.png`,
  "Sobre o Sentido da Vida": `${BASE}images/books/Sobre o Sentido da Vida.jpg`,
  "Maestria": `${BASE}images/books/Maestria.webp`,
  "O Obstáculo é o Caminho": `${BASE}images/books/O Obstáculo é o Caminho.webp`,
  "Diário Estoico": `${BASE}images/books/Diário Estoico.webp`,
  "Ikigai": `${BASE}images/books/Ikigai.webp`,
  "Limites: Quando Dizer Sim Quando Dizer Não": `${BASE}images/books/Limites - Quando Dizer Sim, Quando Dizer Não.webp`,
  "Limites: Quando Dizer Sim, Quando Dizer Não": `${BASE}images/books/Limites - Quando Dizer Sim, Quando Dizer Não.webp`,
};

function getCover(book: { title: string; image_url?: string | null }): string | null {
  if (book.image_url) return book.image_url;
  return COVER_MAP[book.title] || null;
}

const BooksHub = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { books, loading } = useBooks();
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!isBonusEnabled("books")) navigate("/bonus", { replace: true });
  }, [navigate]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach((b: any) => { if (b.category) cats.add(b.category); });
    return [{ value: "all", label: "Todos" }, ...Array.from(cats).map((c) => ({ value: c, label: c }))];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === "all") return books;
    return books.filter((b: any) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const cardStyle = isDark ? {
    background: "linear-gradient(145deg, #1c1c1c 0%, #141414 100%)",
    boxShadow: "0 0 40px rgba(163,230,53,0.03), 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  } : undefined;
  const cardClass = isDark ? "border border-white/[0.08]" : "bg-white border border-gray-100 shadow-sm";

  return (
    <div className="min-h-screen bg-background pb-navbar">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="px-4 max-w-xl mx-auto w-full" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className={cn("p-1.5 rounded-full", isDark ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-600")}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="mb-6">
          <h1 className={cn("text-3xl font-extrabold uppercase leading-tight tracking-tight", isDark ? "text-white" : "text-foreground")}>
            Hub de{" "}
            <span className="italic text-[#A3E635]">Livros</span>
          </h1>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em] mt-1.5", isDark ? "text-white/40" : "text-gray-400")}>
            Biblioteca curada para desenvolvimento pessoal
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                selectedCategory === cat.value
                  ? "bg-lime-400 text-black"
                  : isDark ? "text-white/40 hover:text-white/60 border border-white/10" : "text-muted-foreground hover:text-foreground border border-gray-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* Book cards */
          <div className="space-y-5 pb-4">
            {filteredBooks.map((book: any, i: number) => {
              const cover = getCover(book);
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("rounded-2xl overflow-hidden", cardClass)}
                  style={cardStyle}
                >
                  {/* Cover image */}
                  <div className="relative w-full h-52 overflow-hidden">
                    {cover ? (
                      <img src={cover} alt={book.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn("w-full h-full flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                        <Book className={cn("w-12 h-12", isDark ? "text-white/20" : "text-gray-300")} />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />

                    {/* "EM ALTA" badge on first */}
                    {i === 0 && selectedCategory === "all" && (
                      <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full bg-lime-400/20 text-lime-300 backdrop-blur-sm border border-lime-400/20">
                        Em Alta
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {/* Category + rating */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-[10px] uppercase tracking-widest font-bold", isDark ? "text-lime-400/60" : "text-lime-600")}>
                        {book.category || "Geral"}
                      </span>
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className={cn("text-xs font-semibold", isDark ? "text-white/60" : "text-muted-foreground")}>
                            {Number(book.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title + author */}
                    <h3 className={cn("text-lg font-bold leading-tight mb-1", isDark ? "text-white" : "text-foreground")}>
                      {book.title}
                    </h3>
                    <p className={cn("text-xs mb-2", isDark ? "text-white/30" : "text-muted-foreground")}>
                      {book.author}
                    </p>

                    {/* Description */}
                    {book.description && (
                      <p className={cn("text-xs leading-relaxed mb-3 line-clamp-2", isDark ? "text-white/40" : "text-muted-foreground")}>
                        {book.description}
                      </p>
                    )}

                    {/* Footer: reads + button */}
                    <div className="flex items-center justify-between">
                      <div className={cn("flex items-center gap-1.5 text-[11px]", isDark ? "text-white/25" : "text-muted-foreground")}>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{Math.floor(Math.random() * 20 + 5)}k</span>
                      </div>
                      <button
                        onClick={() => window.open(book.affiliate_link ?? "#", "_blank")}
                        disabled={!book.affiliate_link}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                          book.affiliate_link
                            ? isDark ? "bg-lime-400/15 text-lime-300 border border-lime-400/30 hover:bg-lime-400/25" : "bg-lime-100 text-lime-700 border border-lime-300 hover:bg-lime-200"
                            : "opacity-30 cursor-not-allowed bg-white/5 text-white/30"
                        )}
                      >
                        Ver Livro
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BooksHub;
