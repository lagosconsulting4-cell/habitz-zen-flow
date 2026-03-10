import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, MessageSquareHeart, Sparkles } from 'lucide-react';

// ─── MOTIVOS POR FAIXA ────────────────────────────────────────────────────────

const MOTIVOS: Record<string, string[]> = {
    detrator: [
        "A ferramenta não entregou o que eu esperava.",
        "Tive problemas técnicos que nunca foram resolvidos.",
        "Não consegui criar hábitos ou rotinas com ela.",
        "A promessa da divulgação era diferente da realidade.",
        "Outro."
    ],
    neutro: [
        "Faltou algum recurso que eu precisava.",
        "Não consegui criar o hábito de usar no dia a dia.",
        "Tive problemas técnicos pontuais.",
        "Outro."
    ],
    promotor: [
        "Mudou minha rotina e produtividade.",
        "Interface simples e fácil de usar.",
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

// ─── VALIDAÇÃO DA DOR (Mapeamento empático) ───────────────────────────────────

const VALIDACOES: Record<string, string> = {
    "A ferramenta não entregou o que eu esperava.": "Quando uma ferramenta não entrega o que prometeu, a frustração é completamente legítima. Não é exagero — é uma decepção real.",
    "Tive problemas técnicos que nunca foram resolvidos.": "Pagar por algo que não funciona é uma das piores experiências como consumidor. Você merecia uma solução, não uma desculpa.",
    "Não consegui criar hábitos ou rotinas com ela.": "Mudar hábitos é genuinamente difícil. Uma ferramenta que não te ajuda nessa transição é uma ferramenta que falhou — e não você.",
    "A promessa da divulgação era diferente da realidade.": "Expectativa errada criada pela comunicação da nossa empresa é um erro nosso, não seu. Sentimos muito por isso.",
    "Faltou algum recurso que eu precisava.": "Faz sentido. Uma ferramenta que não resolve o que você precisava não é a ferramenta certa — ainda.",
    "Não consegui criar o hábito de usar no dia a dia.": "Engajamento é o maior desafio de qualquer app de hábitos. Se a ferramenta não facilitou esse engajamento, ela falhou.",
    "Tive problemas técnicos pontuais.": "Até problemas pontuais geram desconfiança na ferramenta. É uma experiência que não deveria acontecer.",
    "Outro.": "Não importa qual tenha sido o motivo: se não funcionou para você, isso é suficiente para justificar sua decisão."
};

// ─── OFERTAS DE WIN-BACK (por motivo + produto) ───────────────────────────────

const OFERTAS: Record<string, Record<string, string>> = {
    "A ferramenta não entregou o que eu esperava.": {
        Bora: "Refinamos completamente o mapeamento de dores do Bora. Se você voltar, nossa equipe gera uma nova trilha pessoalmente — sem repetir o erro anterior.",
        Foquinha: "A Foquinha passou por uma atualização significativa. Ela agora se adapta ao seu estilo em 24h. Se voltar, podemos recomeçar do zero com ela."
    },
    "Tive problemas técnicos que nunca foram resolvidos.": {
        Bora: "Os bugs relatados na época foram corrigidos. Se você voltar, garantimos uma sessão de onboarding 1:1 com suporte técnico para garantir que tudo rode perfeitamente no seu dispositivo.",
        Foquinha: "O bug do 'Modo Teste' que prejudicou muitos usuários foi corrigido. Se você voltar, garantimos 1 semana gratuita para testar a versão estável."
    },
    "Não consegui criar hábitos ou rotinas com ela.": {
        Bora: "A responsabilidade de criar o engajamento é nossa, não sua. Se você voltar, resertamos seu mapeamento e geramos uma rotina cirurgicamente simples — 10 minutos por dia, sem sobrecarga.",
        Foquinha: "Nossa equipe pode configurar a Foquinha com você, em tempo real, para que os lembretes se encaixem exatamente no que você já faz. Sem esforço extra."
    },
    "A promessa da divulgação era diferente da realidade.": {
        Bora: "Estamos revisando toda a comunicação do Bora para alinhar a expectativa à realidade. Se nos disser o que você esperava, podemos te mostrar se isso já é possível hoje.",
        Foquinha: "Queremos entender exatamente o que foi prometido e não entregue. Esse feedback vai direto para quem define a comunicação do produto."
    },
    "Faltou algum recurso que eu precisava.": {
        Bora: "Novos recursos são lançados a cada sprint. Qual funcionalidade você precisava que não existia? Pode ser que ela já exista hoje ou esteja no roadmap dos próximos 30 dias.",
        Foquinha: "A Foquinha tem integrações que nem sempre são comunicadas bem. Me diga o que você precisava — pode ser que já seja possível."
    },
    "Não consegui criar o hábito de usar no dia a dia.": {
        Bora: "Podemos simplificar radicalmente a sua rotina no Bora — uma única ação por dia, no horário que você definir. Se isso fosse suficiente para começar, você daria uma segunda chance?",
        Foquinha: "Podemos configurar apenas um lembrete diário com a Foquinha, com uma tarefa simples que você já faz. O engajamento cresce naturalmente a partir daí."
    },
    "Tive problemas técnicos pontuais.": {
        Bora: "Corrigimos as instabilidades e melhoramos a performance geral do app. Se você voltar, nossa equipe acompanha os primeiros 7 dias para garantir que não haja nenhum problema.",
        Foquinha: "A estabilidade da Foquinha melhorou muito nas últimas semanas. Se você voltar, monitoramos sua conta de perto nos primeiros dias."
    },
    "Outro.": {
        Bora: "Mesmo sem saber exatamente o que aconteceu, queremos fazer diferente. Se você nos contar o que precisaria para considerar voltar, ouviremos com muita atenção.",
        Foquinha: "Queremos entender o que precisaria mudar para você considerar voltar. Sua opinião tem peso real aqui."
    }
};

function getValidacao(motivo: string): string {
    return VALIDACOES[motivo] || VALIDACOES["Outro."];
}

function getOferta(motivo: string, produto: string): string {
    const key = OFERTAS[motivo] ? motivo : "Outro.";
    return OFERTAS[key][produto] || OFERTAS[key]['Bora'];
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
    const [aceitouOferta, setAceitouOferta] = useState<boolean | null>(null);

    const [email, setEmail] = useState('');
    const [produto, setProduto] = useState('');
    const [nota, setNota] = useState<number | null>(null);
    const [motivo, setMotivo] = useState('');
    const [outroMotivo, setOutroMotivo] = useState('');
    const [respostaOferta, setRespostaOferta] = useState('');
    const [comentario, setComentario] = useState('');

    const goNext = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };

    const faixa = nota !== null ? getFaixa(nota) : null;
    const isDetrator = faixa === 'detrator' || faixa === 'neutro';
    const motivoFinal = motivo === 'Outro.' ? `Outro: ${outroMotivo}` : motivo;

    const step1Valid = produto !== '';
    const step2Valid = nota !== null;
    const step3Valid = motivo !== '' && (motivo !== 'Outro.' || outroMotivo.trim().length >= 3);

    // Passos dinâmicos:
    // Detratores: 1 Intro → 2 Nota → 3 Motivo → 4 Validação+Oferta → 5 Resposta Oferta (se aceite) → 6 Comentário → 7 Sucesso
    // Promotores: 1 Intro → 2 Nota → 3 Motivo → 4 Comentário → 5 Sucesso

    const submit = async (skipComment = false) => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('nps_feedback').insert({
                email: email || null,
                produto,
                nota: nota!,
                motivo: motivoFinal,
                comentario: [
                    aceitouOferta === true ? `[Aceitou oferta] ${respostaOferta}` : aceitouOferta === false ? '[Recusou oferta]' : null,
                    skipComment ? null : comentario
                ].filter(Boolean).join('\n\n') || null
            });
            if (error) { console.error(error); setIsSubmitting(false); return; }
            // Vai para o step de sucesso
            if (isDetrator) {
                setStep(7);
            } else {
                setStep(5);
            }
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const totalSteps = isDetrator ? 5 : 3;
    const currentProgressStep = Math.min(step, totalSteps);
    const progress = Math.round((currentProgressStep / totalSteps) * 100);

    const successStep = isDetrator ? 7 : 5;

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

                            {/* ── 1: INTRO ── */}
                            {step === 1 && (
                                <motion.div key="s1" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div className="flex items-start gap-3">
                                        <MessageSquareHeart size={26} className="text-gray-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h2 className="text-2xl font-semibold tracking-tight">Sua opinião importa de verdade.</h2>
                                            <p className="text-gray-500 text-[15px] mt-1.5 leading-relaxed">
                                                Queremos entender como foi a sua experiência com a Lumen Apps — e se há algo que podemos fazer por você.
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
                                        <label className="text-sm font-semibold text-gray-700">E-mail <span className="font-normal text-gray-400">(opcional)</span></label>
                                        <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                                            className="border-0 border-b-2 border-gray-200 pb-2 pt-1 text-[15px] text-gray-900 bg-white placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-colors" />
                                    </div>

                                    <button disabled={!step1Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 2: NOTA ── */}
                            {step === 2 && (
                                <motion.div key="s2" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">
                                            De 0 a 10, o quanto você indicaria o <span className="text-gray-500">{produto}</span> para alguém?
                                        </h2>
                                        <p className="text-gray-400 text-[13px]">0 = jamais · 10 = com certeza</p>
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
                                            className={`font-medium text-[15px] ${nota <= 6 ? 'text-red-500' : nota <= 8 ? 'text-amber-500' : 'text-green-600'}`}>
                                            {nota <= 6 ? '😔 Sentimos muito. Vamos entender melhor.' : nota <= 8 ? '🙂 Obrigado. Queremos ouvir mais.' : '🌟 Que alegria ouvir isso!'}
                                        </motion.p>
                                    )}

                                    <button disabled={!step2Valid} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 3: MOTIVO ── */}
                            {step === 3 && nota !== null && faixa && (
                                <motion.div key="s3" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">
                                            {faixa === 'promotor' ? 'O que mais te agradou?' : `Com nota ${nota}, o que pesou mais na sua experiência?`}
                                        </h2>
                                        {isDetrator && (
                                            <p className="text-gray-500 text-[15px] leading-relaxed">
                                                Seja honesto — cada resposta vai diretamente para quem pode mudar isso.
                                            </p>
                                        )}
                                    </div>

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

                            {/* ── 4: MAPEAMENTO DA DOR + OFERTA (apenas detratores) ── */}
                            {step === 4 && isDetrator && (
                                <motion.div key="s4" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    {/* Validação da dor */}
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Entendemos o que aconteceu</p>
                                        <p className="text-[15px] text-gray-800 leading-relaxed">
                                            {getValidacao(motivoFinal)}
                                        </p>
                                    </div>

                                    {/* Ponte para a oferta */}
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-indigo-400 flex-shrink-0" />
                                        <p className="text-[14px] text-gray-500">Mas algo mudou desde então. Seria justo te mostrar?</p>
                                    </div>

                                    {/* Oferta */}
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-[15px] text-gray-900 leading-relaxed">
                                        {getOferta(motivoFinal, produto)}
                                    </div>

                                    {/* Aceita ou não? */}
                                    <p className="text-sm font-semibold text-gray-700">Isso muda algo para você?</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => { setAceitouOferta(true); goNext(); }}
                                            className="py-3.5 rounded-xl border-2 border-black bg-black text-white font-medium text-[15px] hover:bg-gray-800 transition-all">
                                            Sim, me interessa
                                        </button>
                                        <button onClick={() => { setAceitouOferta(false); goNext(); }}
                                            className="py-3.5 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-[15px] hover:border-gray-300 transition-all">
                                            Não, obrigado
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 5: RESPOSTA DA OFERTA (se aceitou) ── */}
                            {step === 5 && isDetrator && aceitouOferta === true && (
                                <motion.div key="s5-sim" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Ótimo! Nos conte mais.</h2>
                                        <p className="text-gray-500 text-[15px] leading-relaxed">
                                            Para que nossa equipe entre em contato da forma certa, nos diga o que você precisa para considerar voltar.
                                        </p>
                                    </div>
                                    <textarea value={respostaOferta} onChange={e => setRespostaOferta(e.target.value)}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all min-h-[130px] resize-y" />
                                    <button disabled={respostaOferta.trim().length < 5} onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 5: PULO (se recusou) ── */}
                            {step === 5 && isDetrator && aceitouOferta === false && (
                                <motion.div key="s5-nao" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Tudo bem. Respeitamos sua decisão.</h2>
                                        <p className="text-gray-500 text-[15px]">Tem mais algo que você queira nos dizer?</p>
                                    </div>
                                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[130px] resize-none" />
                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => submit(false)} disabled={isSubmitting}
                                            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400">
                                            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                                        </button>
                                        <button onClick={() => submit(true)} disabled={isSubmitting}
                                            className="text-gray-400 text-[14px] hover:text-gray-600 transition-colors py-2">
                                            Pular e finalizar
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 6: COMENTÁRIO LIVRE (após aceitou oferta OU promotores) ── */}
                            {((step === 6 && isDetrator && aceitouOferta === true) || (step === 4 && !isDetrator)) && (
                                <motion.div key="s-comment" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">
                                            {aceitouOferta ? 'Perfeito! Alguma coisa a mais?' : 'Quer adicionar mais alguma coisa?'}
                                        </h2>
                                        <p className="text-gray-500 text-[15px]">Totalmente opcional.</p>
                                    </div>
                                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[140px] resize-none leading-relaxed" />
                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => submit(false)} disabled={isSubmitting}
                                            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400">
                                            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                                        </button>
                                        <button onClick={() => submit(true)} disabled={isSubmitting}
                                            className="text-gray-400 text-[14px] hover:text-gray-600 transition-colors py-2">
                                            Pular e finalizar
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
                                    <h2 className="text-2xl font-semibold tracking-tight">Avaliação recebida.</h2>
                                    <div className="text-gray-500 text-[15px] leading-relaxed max-w-sm space-y-2">
                                        <p>Cada resposta alimenta o roadmap do produto diretamente.</p>
                                        {aceitouOferta && (
                                            <p className="text-gray-700 font-medium">Nossa equipe vai entrar em contato em breve com base no que você nos disse.</p>
                                        )}
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
