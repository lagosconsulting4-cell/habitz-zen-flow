import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, MessageSquareHeart, Sparkles } from 'lucide-react';

// ─── MOTIVOS POR FAIXA DE NOTA ────────────────────────────────────────────────

const MOTIVOS: Record<string, string[]> = {
    detrator: [
        "A ferramenta não funcionou como eu esperava.",
        "Tive problemas técnicos que não foram resolvidos.",
        "Não me ajudou a criar hábitos ou rotinas.",
        "Não atendeu ao que foi prometido na divulgação.",
        "Outro."
    ],
    neutro: [
        "Faltou algum recurso que eu precisava.",
        "O app é bom, mas não me engajei o suficiente.",
        "Tive alguns problemas técnicos pontuais.",
        "Não consegui criar o hábito de usar.",
        "Outro."
    ],
    promotor: [
        "Mudou minha rotina e produtividade.",
        "Fácil de usar e bem projetado.",
        "A personalização me surpreendeu.",
        "O suporte foi rápido e atencioso.",
        "Outro."
    ]
};

function getFaixa(nota: number): 'detrator' | 'neutro' | 'promotor' {
    if (nota <= 6) return 'detrator';
    if (nota <= 8) return 'neutro';
    return 'promotor';
}

// ─── SOLUÇÕES DE WIN-BACK (por motivo + produto) ──────────────────────────────

const SOLUCOES: Record<string, Record<string, string>> = {
    "A ferramenta não funcionou como eu esperava.": {
        Bora: "Refinamos completamente o sistema de mapeamento de dores do Bora. Usuários que voltaram após o reset relatam uma aderência muito maior à rotina gerada. <span class=\"font-semibold text-indigo-600\">Você toparia testar a versão nova, sem compromisso?</span>",
        Foquinha: "Melhoramos muito o sistema de aprendizado da Foquinha. Ela agora se calibra ao seu jeito de escrever em menos de 24h. <span class=\"font-semibold text-indigo-600\">Você toparia dar uma segunda chance a ela?</span>"
    },
    "Tive problemas técnicos que não foram resolvidos.": {
        Bora: "Todos os bugs relatados nas últimas semanas foram corrigidos na versão atual. <span class=\"font-semibold text-indigo-600\">Se você voltar, nossa equipe garante uma sessão de onboarding pessoal para garantir que tudo funcione perfeitamente no seu dispositivo.</span>",
        Foquinha: "O bug do 'Modo Teste' que afetou vários usuários foi corrigido. A Foquinha está estável. <span class=\"font-semibold text-indigo-600\">Se você voltar, garantimos 1 semana gratuita para testar a versão corrigida.</span>"
    },
    "Não me ajudou a criar hábitos ou rotinas.": {
        Bora: "Entendemos. Criar hábitos exige mais do que uma ferramenta — exige o mapeamento certo. <span class=\"font-semibold text-indigo-600\">Se você voltar, nossa equipe reseta seu mapeamento e gera uma trilha 100% focada na sua dor hoje, pessoalmente.</span>",
        Foquinha: "A Foquinha se encaixa melhor quando integrada a uma rotina já existente. <span class=\"font-semibold text-indigo-600\">Nosso time pode configurar os lembretes do zero com você, em uma sessão rápida via WhatsApp.</span>"
    },
    "Não atendeu ao que foi prometido na divulgação.": {
        Bora: "Sentimos muito se as expectativas foram mal criadas. Estamos revisando toda a comunicação do produto. <span class=\"font-semibold text-indigo-600\">Antes de ir de vez: o que você esperava e não encontrou? Queremos corrigir isso.</span>",
        Foquinha: "Isso é extremamente importante para nós. <span class=\"font-semibold text-indigo-600\">Pode nos dizer o que foi prometido e não entregue? Usaremos isso para corrigir nossa comunicação e, se couber, para te apresentar uma solução real.</span>"
    },
    "Faltou algum recurso que eu precisava.": {
        Bora: "Novos recursos são lançados a cada sprint. <span class=\"font-semibold text-indigo-600\">Qual funcionalidade você mais sentiu falta? Pode ser que ela já exista ou esteja no roadmap para os próximos 30 dias.</span>",
        Foquinha: "A Foquinha é altamente customizável. <span class=\"font-semibold text-indigo-600\">Qual integração ou funcionalidade você precisava? Nossa equipe pode mapear se é tecnicamente possível hoje.</span>"
    },
    "default": {
        Bora: "Ficamos muito felizes com o seu feedback. Ele vai diretamente para o time de produto. <span class=\"font-semibold text-indigo-600\">Há algo que você gostaria que melhorasse antes de considerar voltar a usar o Bora?</span>",
        Foquinha: "Ficamos muito felizes com o seu feedback. Ele vai diretamente para o time de produto. <span class=\"font-semibold text-indigo-600\">Há algo que você gostaria que melhorasse antes de considerar voltar a usar a Foquinha?</span>"
    }
};

function getSolucao(motivo: string, produto: string): string {
    const key = SOLUCOES[motivo] ? motivo : 'default';
    return SOLUCOES[key][produto] || SOLUCOES[key]['Bora'];
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
    const [respostaSolucao, setRespostaSolucao] = useState('');
    const [comentario, setComentario] = useState('');

    const goNext = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };

    const faixa = nota !== null ? getFaixa(nota) : null;
    const isDetrator = faixa === 'detrator' || faixa === 'neutro';
    const motivoFinal = motivo === 'Outro.' ? `Outro: ${outroMotivo}` : motivo;

    const step1Valid = produto !== '';
    const step2Valid = nota !== null;
    const step3Valid = motivo !== '' && (motivo !== 'Outro.' || outroMotivo.trim().length >= 3);
    // Para detratores/neutros: step 4 é a solução (win-back), então validamos resposta
    const step4Valid = respostaSolucao.trim().length >= 3;

    // O step final de comentário é sempre o último antes do sucesso
    const commentStep = isDetrator ? 5 : 4;
    const successStep = isDetrator ? 6 : 5;
    const totalSteps = isDetrator ? 5 : 4;

    const submit = async () => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('nps_feedback').insert({
                email: email || null,
                produto,
                nota: nota!,
                motivo: motivoFinal,
                comentario: [respostaSolucao, comentario].filter(Boolean).join('\n\n---\n\n') || null
            });
            if (error) { console.error(error); setIsSubmitting(false); return; }
            setStep(successStep);
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const currentStep = step;
    const progress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            <header className="bg-black text-white py-5 flex justify-center items-center sticky top-0 z-10">
                <span className="text-lg tracking-[0.25em] font-light">LUMEN APPS</span>
            </header>

            <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 flex flex-col">

                {step < successStep && (
                    <div className="mb-8">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black rounded-full"
                                initial={{ width: `${Math.max(0, progress - 20)}%` }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100">
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* ── STEP 1: IDENTIFICAÇÃO ── */}
                            {step === 1 && (
                                <motion.div key="s1" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div className="flex items-start gap-3">
                                        <MessageSquareHeart size={26} className="text-gray-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h2 className="text-2xl font-semibold tracking-tight">Sua opinião importa.</h2>
                                            <p className="text-gray-500 text-[15px] mt-1 leading-relaxed">
                                                Queremos entender como foi a sua experiência — e se há algo que podemos fazer por você.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-semibold text-gray-700">Qual ferramenta você usou?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Bora', 'Foquinha'].map(p => (
                                                <button key={p} onClick={() => setProduto(p)}
                                                    className={`py-4 rounded-xl border-2 font-medium text-[15px] transition-all ${produto === p ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-gray-700">
                                            E-mail <span className="font-normal text-gray-400">(opcional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="border-0 border-b-2 border-gray-200 pb-2 pt-1 text-[15px] text-gray-900 bg-white placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                                        />
                                    </div>

                                    <button disabled={!step1Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
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

                                    <div className="grid grid-cols-6 gap-2">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <button key={n} onClick={() => setNota(n)}
                                                className={`aspect-square rounded-xl text-[15px] font-semibold transition-all border-2 ${nota === n
                                                        ? n <= 6 ? 'border-red-400 bg-red-50 text-red-600'
                                                            : n <= 8 ? 'border-amber-400 bg-amber-50 text-amber-600'
                                                                : 'border-green-400 bg-green-50 text-green-600'
                                                        : 'border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>

                                    {nota !== null && (
                                        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                            className={`text-[15px] font-medium ${nota <= 6 ? 'text-red-500' : nota <= 8 ? 'text-amber-500' : 'text-green-500'}`}>
                                            {nota <= 6 ? '😔 Sentimos muito por isso.' : nota <= 8 ? '🙂 Obrigado pelo feedback!' : '🌟 Que alegria ouvir isso!'}
                                        </motion.p>
                                    )}

                                    <button disabled={!step2Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 3: MOTIVO ── */}
                            {step === 3 && nota !== null && faixa && (
                                <motion.div key="s3" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        {faixa === 'detrator' ? 'O que pesou mais na sua experiência?' : faixa === 'neutro' ? 'O que poderia ser melhor?' : 'O que mais te agradou?'}
                                    </h2>

                                    <div className="flex flex-col gap-2.5">
                                        {MOTIVOS[faixa].map(m => {
                                            const sel = motivo === m;
                                            return (
                                                <div key={m} className="flex flex-col">
                                                    <div onClick={() => setMotivo(m)}
                                                        className={`flex items-center gap-3.5 p-4 rounded-xl cursor-pointer border-2 transition-all ${sel ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <span className={`text-[14.5px] leading-snug ${sel ? 'font-medium text-black' : 'text-gray-600'}`}>{m}</span>
                                                    </div>
                                                    {m === 'Outro.' && sel && (
                                                        <div className="pl-9 pt-2">
                                                            <input type="text" value={outroMotivo} onChange={e => setOutroMotivo(e.target.value)}
                                                                placeholder="Descreva brevemente..."
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none transition-all" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button disabled={!step3Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 4: WIN-BACK (apenas detratores e neutros) ── */}
                            {step === 4 && isDetrator && (
                                <motion.div key="s4" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles size={18} className="text-indigo-400" />
                                            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Encontramos algo para você</span>
                                        </div>
                                        <h2 className="text-2xl font-semibold tracking-tight">Antes de ir de vez...</h2>
                                    </div>

                                    {/* Card de solução */}
                                    <div
                                        className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-[15px] text-gray-900 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: getSolucao(motivoFinal, produto) }}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-700">O que você acha?</label>
                                        <textarea
                                            value={respostaSolucao}
                                            onChange={e => setRespostaSolucao(e.target.value)}
                                            placeholder="Escreva aqui..."
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all min-h-[110px] resize-y"
                                        />
                                    </div>

                                    <button disabled={!step4Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP COMENTÁRIO LIVRE ── */}
                            {step === commentStep && (
                                <motion.div key="s-comment" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Quer adicionar mais alguma coisa?</h2>
                                        <p className="text-gray-500 text-[15px]">Totalmente opcional. Qualquer detalhe ajuda.</p>
                                    </div>

                                    <textarea
                                        value={comentario}
                                        onChange={e => setComentario(e.target.value)}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[150px] resize-none leading-relaxed"
                                    />

                                    <div className="flex flex-col gap-3">
                                        <button onClick={submit} disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400">
                                            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</> : 'Enviar Avaliação'}
                                        </button>
                                        <button onClick={submit} disabled={isSubmitting}
                                            className="text-gray-400 text-[14px] hover:text-gray-600 transition-colors py-2">
                                            Pular e enviar sem comentário
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── SUCESSO ── */}
                            {step === successStep && (
                                <motion.div key="s-success" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center gap-5 py-10">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={34} className="text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Feedback recebido!</h2>
                                    <div className="text-gray-500 text-[15px] leading-relaxed max-w-sm space-y-2">
                                        <p>Cada resposta é lida pela nossa equipe e alimenta o roadmap do produto diretamente.</p>
                                        {isDetrator && <p className="font-medium text-gray-700">Se você indicou interesse em voltar, entraremos em contato em breve.</p>}
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
