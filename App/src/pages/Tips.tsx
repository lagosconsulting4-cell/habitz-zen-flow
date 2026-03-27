import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Plus, Play, Sun, Moon, Coffee, Dumbbell, Bell, Check } from "lucide-react";
import { routineTips } from "@/data/routine-tips";
import { nutritionTips } from "@/data/nutrition-tips";
import { useHabits } from "@/hooks/useHabits";
import useMeditations from "@/hooks/useMeditations";
import { isBonusEnabled } from "@/config/bonusFlags";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const MEDITATION_COVERS = [
  `${import.meta.env.BASE_URL}images/meditation/mountains.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/stones.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/forest.jpg`,
];

const CATEGORY_ICONS: Record<string, typeof Sun> = {
  "Manhã": Sun, "Tarde": Coffee, "Noite": Moon,
  "Pré-treino": Dumbbell, "Pós-treino": Dumbbell, "Almoço/Jantar": Coffee,
};

const IMPACT_COLORS: Record<string, string> = {
  "Leve": "text-lime-400/70 border-lime-400/20 bg-lime-400/5",
  "Moderado": "text-amber-400/70 border-amber-400/20 bg-amber-400/5",
  "Alto": "text-red-400/70 border-red-400/20 bg-red-400/5",
};

// Map tip period to habit category
const PERIOD_TO_CATEGORY: Record<string, string> = {
  "Manhã": "corpo", "Tarde": "mente", "Noite": "mente",
  "Pré-treino": "corpo", "Pós-treino": "corpo", "Almoço/Jantar": "nutrition",
};

const Tips = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { sessions: meditations } = useMeditations();
  const { habits } = useHabits();
  const [tab, setTab] = useState<"rotina" | "nutricao" | "sono">("rotina");

  useEffect(() => {
    if (!isBonusEnabled("tips")) navigate("/bonus", { replace: true });
  }, [navigate]);

  // Check if a tip was already added as habit
  const isAdded = (title: string) => habits.some((h) => h.is_active && h.name.toLowerCase() === title.toLowerCase());

  const tips = useMemo(() => {
    if (tab === "rotina") {
      return routineTips.map((t) => ({ id: `r-${t.id}`, title: t.title, description: t.description, period: t.category, duration: t.time_suggestion, impact: t.impact }));
    }
    if (tab === "nutricao") {
      return nutritionTips.map((t) => ({ id: `n-${t.id}`, title: t.title, description: t.description, period: t.meal_time, duration: "", impact: t.impact }));
    }
    return routineTips.filter((t) => t.category === "Noite").map((t) => ({ id: `s-${t.id}`, title: t.title, description: t.description, period: t.category, duration: t.time_suggestion, impact: t.impact }));
  }, [tab]);

  const dailyMeditation = useMemo(() => {
    if (!meditations.length) return null;
    return meditations[new Date().getDate() % meditations.length];
  }, [meditations]);

  const handleAdd = (tip: { title: string; period: string }) => {
    if (isAdded(tip.title)) return;
    navigate("/create", {
      state: {
        prefilledName: tip.title,
        prefilledCategory: PERIOD_TO_CATEGORY[tip.period] || "outro",
        prefilledPeriod: tip.period === "Manhã" ? "morning" : tip.period === "Tarde" ? "afternoon" : "evening",
      },
    });
  };

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
            Pulso{" "}
            <span className="italic text-[#A3E635]">Diário</span>
          </h1>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em] mt-1.5", isDark ? "text-white/40" : "text-gray-400")}>
            Pequenas ações, grandes mudanças
          </p>
        </div>

        {/* Tabs — green when selected */}
        <div className="flex gap-2 mb-6">
          {([{ id: "rotina", label: "Rotina" }, { id: "nutricao", label: "Nutrição" }, { id: "sono", label: "Sono" }] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-lime-400 text-black"
                : isDark ? "text-white/40 hover:text-white/60 border border-white/10" : "text-muted-foreground hover:text-foreground border border-gray-200"
            )}>{t.label}</button>
          ))}
        </div>

        {/* Tips */}
        <div className="space-y-4">
          {tips.map((tip, i) => {
            const Icon = CATEGORY_ICONS[tip.period] || Sun;
            const impactClass = IMPACT_COLORS[tip.impact] || IMPACT_COLORS["Leve"];
            const added = isAdded(tip.title);

            return (
              <motion.div key={tip.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn("rounded-2xl p-5", cardClass)} style={cardStyle}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-lime-400" />
                      <span className={cn("text-[10px] uppercase tracking-widest font-bold", isDark ? "text-lime-400/60" : "text-lime-600")}>{tip.period}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", isDark ? "text-lime-300" : "text-lime-600")} />
                      <h3 className={cn("text-base font-bold leading-tight", isDark ? "text-white" : "text-foreground")}>{tip.title}</h3>
                    </div>
                  </div>
                  {/* Smaller impact badge */}
                  <span className={cn("text-[8px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border flex-shrink-0 text-center leading-tight", impactClass)}>
                    Impacto<br />{tip.impact}
                  </span>
                </div>

                <p className={cn("text-xs leading-relaxed mb-3", isDark ? "text-white/40" : "text-muted-foreground")}>{tip.description}</p>

                <div className="flex items-center justify-between">
                  {tip.duration && (
                    <div className={cn("flex items-center gap-1.5 text-[11px]", isDark ? "text-white/30" : "text-muted-foreground")}>
                      <Clock className="w-3 h-3" /><span>{tip.duration}</span>
                    </div>
                  )}
                  {added ? (
                    <div className={cn("flex items-center gap-1 text-xs font-bold ml-auto", isDark ? "text-white/30" : "text-muted-foreground")}>
                      Adicionado <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <button onClick={() => handleAdd(tip)} className={cn("flex items-center gap-1 text-xs font-bold ml-auto uppercase tracking-wider", isDark ? "text-lime-400 hover:text-lime-300" : "text-lime-600 hover:text-lime-500")}>
                      Adicionar <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ação do Dia */}
        {dailyMeditation && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={cn("rounded-2xl overflow-hidden relative h-48 mt-6 mb-4 cursor-pointer", isDark ? "border border-white/[0.06]" : "border border-gray-100 shadow-lg")}
            onClick={() => navigate("/meditation")}
          >
            <img src={dailyMeditation.cover_image_url || MEDITATION_COVERS[new Date().getDate() % MEDITATION_COVERS.length]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-lime-400/60 mb-1">Ação do Dia</p>
              <h3 className="text-xl font-black text-white uppercase">{dailyMeditation.title}</h3>
              <p className="text-xs text-white/50 mt-1">{dailyMeditation.description?.substring(0, 80) || "Redução imediata de cortisol."}</p>
            </div>
            <button className="absolute bottom-5 right-5 z-10 w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center" style={{ boxShadow: "0 4px 20px rgba(163,230,53,0.4)" }}>
              <Play className="w-5 h-5 text-black ml-0.5" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Tips;
