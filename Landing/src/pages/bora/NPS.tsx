import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, CheckCircle2, MessageSquareHeart } from 'lucide-react';

// ─── MOTIVOS POR NOTA NPS ─────────────────────────────────────────────────────

const MOTIVOS_DETRATORES = [
    "O app não funcionou como eu esperava.",
    "Tive muitos problemas técnicos.",
    "O suporte não me atendeu bem.",
    "A ferramenta não me ajudou a mudar minha rotina.",
    "Outro."
];

const MOTIVOS_NEUTROS = [
    "Faltou algum recurso que eu precisava.",
    "O app é bom, mas não me engajei o suficiente.",
    "Tive alguns problemas técnicos pontuais.",
    "Não consegui criar o hábito de usar.",
    "Outro."
];

const MOTIVOS_PROMOTORES = [
    "Mudou minha rotina e produtividade.",
    "Interface simples e fácil de usar.",
    "A personalização da IA me surpreendeu.",
    "Suporte rápido e atencioso.",
    "Outro."
];

function getMotivosByNota(nota: number) {
    if (nota <= 6) return MOTIVOS_DETRATORES;
    if (nota <= 8) return MOTIVOS_NEUTROS;
    return MOTIVOS_PROMOTORES;
}

function getLabelByNota(nota: number) {
    if (nota <= 6) return { emoji: "😔", label: "Sentimos muito por isso.", color: "text-red-500" };
    if (nota <= 8) return { emoji: "🙂", label: "Obrigado pelo feedback!", color: "text-amber-500" };
    return { emoji: "🌟", label: "Que alegria ouvir isso!", color: "text-green-500" };
}

// ─── ANIMAÇÕES ────────────────────────────────────────────────────────────────

const variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
} as const;

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function NPS() {
    useEffect(() => { document.title = "Avalie sua Experiência — Lumen Apps"; }, []);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [email, setEmail] = useState('');
    const [produto, setProduto] = useState('');
    const [nota, setNota] = useState<number | null>(null);
    const [motivo, setMotivo] = useState('');
    const [outroMotivo, setOutroMotivo] = useState('');
    const [comentario, setComentario] = useState('');

    const goNext = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };

    const step1Valid = produto !== '';
    const step2Valid = nota !== null;
    const step3Valid = motivo !== '' && (motivo !== 'Outro.' || outroMotivo.trim().length >= 3);

    const motivoFinal = motivo === 'Outro.' ? `Outro: ${outroMotivo}` : motivo;
    const notaLabel = nota !== null ? getLabelByNota(nota) : null;

    const submit = async () => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('nps_feedback').insert({
                email: email || null,
                produto,
                nota: nota!,
                motivo: motivoFinal,
                comentario: comentario || null
            });
            if (error) { console.error(error); setIsSubmitting(false); return; }
            setStep(5);
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const totalSteps = 4;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Header */}
            <header className="bg-black text-white py-5 flex justify-center items-center sticky top-0 z-10">
                <span className="text-lg tracking-[0.25em] font-light">LUMEN APPS</span>
            </header>

            <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 flex flex-col">

                {/* Barra de progresso */}
                {step < 5 && (
                    <div className="mb-8">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black rounded-full"
                                initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100">
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* ── STEP 1: PRODUTO ── */}
                            {step === 1 && (
                                <motion.div key="s1" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div className="flex items-center gap-3">
                                        <MessageSquareHeart size={26} className="text-gray-400 flex-shrink-0" />
                                        <div>
                                            <h2 className="text-2xl font-semibold tracking-tight">Sua opinião importa.</h2>
                                            <p className="text-gray-500 text-[15px] mt-1">Queremos entender como foi sua experiência com a Lumen Apps.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-semibold text-gray-700">Qual ferramenta você usou?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Bora', 'Foquinha'].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setProduto(p)}
                                                    className={`py-4 rounded-xl border-2 font-medium text-[15px] transition-all ${produto === p ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">E-mail <span className="font-normal text-gray-400">(opcional)</span></label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="border-0 border-b-2 border-gray-200 pb-2 pt-1 text-[15px] text-gray-900 bg-white placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                                        />
                                    </div>

                                    <button
                                        disabled={!step1Valid}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 2: NOTA NPS ── */}
                            {step === 2 && (
                                <motion.div key="s2" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">
                                            De 0 a 10, o quanto você recomendaria o <span className="text-gray-500">{produto}</span> para alguém?
                                        </h2>
                                        <p className="text-gray-500 text-[14px]">0 = nunca recomendaria · 10 = recomendaria com certeza</p>
                                    </div>

                                    {/* Grade de notas */}
                                    <div className="grid grid-cols-6 gap-2">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setNota(n)}
                                                className={`aspect-square rounded-xl text-[15px] font-semibold transition-all border-2 ${nota === n
                                                        ? n <= 6
                                                            ? 'border-red-500 bg-red-50 text-red-600'
                                                            : n <= 8
                                                                ? 'border-amber-500 bg-amber-50 text-amber-600'
                                                                : 'border-green-500 bg-green-50 text-green-600'
                                                        : 'border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Feedback visual instantâneo */}
                                    {nota !== null && notaLabel && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-center gap-2 font-medium ${notaLabel.color}`}
                                        >
                                            <span className="text-xl">{notaLabel.emoji}</span>
                                            <span>{notaLabel.label}</span>
                                        </motion.div>
                                    )}

                                    <button
                                        disabled={!step2Valid}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 3: MOTIVO ── */}
                            {step === 3 && nota !== null && (
                                <motion.div key="s3" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        {nota <= 6 ? "O que pesou mais na sua decisão?" : nota <= 8 ? "O que poderia ser melhor?" : "O que mais te agradou?"}
                                    </h2>

                                    <div className="flex flex-col gap-2.5">
                                        {getMotivosByNota(nota).map(m => {
                                            const sel = motivo === m;
                                            return (
                                                <div key={m} className="flex flex-col">
                                                    <div
                                                        onClick={() => setMotivo(m)}
                                                        className={`flex items-center gap-3.5 p-4 rounded-xl cursor-pointer border-2 transition-all ${sel ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <span className={`text-[14.5px] leading-snug ${sel ? 'font-medium text-black' : 'text-gray-600'}`}>{m}</span>
                                                    </div>

                                                    {m === 'Outro.' && sel && (
                                                        <div className="pl-9 pt-2">
                                                            <input
                                                                type="text"
                                                                value={outroMotivo}
                                                                onChange={e => setOutroMotivo(e.target.value)}
                                                                placeholder="Descreva brevemente..."
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={!step3Valid}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 4: COMENTÁRIO LIVRE ── */}
                            {step === 4 && (
                                <motion.div key="s4" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Quer adicionar mais alguma coisa?</h2>
                                        <p className="text-gray-500 text-[15px]">Totalmente opcional. Qualquer feedback ajuda muito.</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={comentario}
                                            onChange={e => setComentario(e.target.value)}
                                            placeholder="Escreva aqui..."
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[150px] resize-none leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={submit}
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>Enviar Avaliação <Star size={16} /></>
                                            )}
                                        </button>
                                        <button
                                            onClick={submit}
                                            disabled={isSubmitting}
                                            className="w-full text-gray-400 text-[14px] hover:text-gray-600 transition-colors py-2"
                                        >
                                            Pular e enviar sem comentário
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── STEP 5: SUCESSO ── */}
                            {step === 5 && (
                                <motion.div key="s5" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center gap-5 py-10">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={34} className="text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Feedback recebido!</h2>
                                    <div className="text-gray-500 text-[15px] leading-relaxed max-w-sm space-y-2">
                                        <p>Sua avaliação chegou. Cada resposta é lida pela nossa equipe e usada para melhorar o produto.</p>
                                        <p>Obrigado pelo seu tempo.</p>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-4">Lumen Apps · Obrigado pelo seu tempo.</p>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                <footer className="mt-8 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Lumen Apps. Todos os direitos reservados.
                </footer>
            </main>
        </div>
    );
}
