import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

// ─── DADOS ───────────────────────────────────────────────────────────────────

const MOTIVOS_BORA = [
    { id: "rotina", label: "A rotina gerada não se encaixou no meu dia." },
    { id: "notificacao", label: "Não recebia notificações para seguir a rotina." },
    { id: "appstore", label: "Esperava um app nas lojas (App Store / Play Store)." },
    { id: "financeiro", label: "Questões financeiras na época." },
    { id: "outro", label: "Outro motivo." },
];

const MOTIVOS_FOQUINHA = [
    { id: "teste", label: "Ficava mandando mensagens de 'Modo Teste'." },
    { id: "lembretes", label: "Não organizou meus lembretes como eu esperava." },
    { id: "aprendizado", label: "Demorou para aprender meu jeito de escrever." },
    { id: "financeiro", label: "Questões financeiras na época." },
    { id: "outro", label: "Outro motivo." },
];

const SOLUCOES: Record<string, Record<string, string>> = {
    Bora: {
        rotina: "Refizemos o mapeamento de dores do zero. A nova versão gera rotinas mais simples e muito mais aderentes ao dia a dia real.",
        notificacao: "O app nativo do Bora está em aprovação final na App Store e Google Play. Notificações nativas resolvidas de vez.",
        appstore: "Bora nativo nas lojas: processo de aprovação na App Store e Google Play em fase final. Em breve você instala de verdade.",
        financeiro: "Entendemos. Por isso criamos uma condição especial para quem já foi cliente — por muito menos do que você pagava antes.",
        outro: "Fizemos mudanças profundas no produto. Queremos que você veja por você mesmo antes de decidir.",
    },
    Foquinha: {
        teste: "O bug do 'Modo Teste' foi causado por uma atualização da API do WhatsApp e já foi corrigido. A Foquinha está estável.",
        lembretes: "Atualizamos o sistema de aprendizado. Ela agora se calibra ao seu estilo em menos de 24h de uso.",
        aprendizado: "O modelo de calibração foi refinado. Ela aprende mais rápido e com menos ajustes manuais da sua parte.",
        financeiro: "Entendemos. Por isso criamos uma condição especial para quem já foi cliente — por muito menos do que você pagava antes.",
        outro: "Fizemos mudanças profundas no produto. Queremos que você veja por você mesmo antes de decidir.",
    },
};

const CHECKOUTS: Record<string, { parcelas: string; link: string; descricao: string }> = {
    Bora: { parcelas: "11x de R$ 5,14", link: "https://pay.hub.la/znOSHkuvQIMxAEe4QGeD", descricao: "App de rotinas personalizadas com IA" },
    Foquinha: { parcelas: "10x de R$ 5,08", link: "https://pay.hub.la/BB8emccD9QrTfcUZOGpt", descricao: "Agenda inteligente no WhatsApp" },
};

// ─── ANIMAÇÃO ─────────────────────────────────────────────────────────────────

const v = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
} as const;

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function NPS() {
    useEffect(() => { document.title = "Sua experiência — Lumen Apps"; }, []);

    const [step, setStep] = useState(1);
    const [produto, setProduto] = useState('');
    const [email, setEmail] = useState('');
    const [motivoId, setMotivoId] = useState('');
    const [outroText, setOutroText] = useState('');
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);

    const motivos = produto === 'Foquinha' ? MOTIVOS_FOQUINHA : MOTIVOS_BORA;
    const motivoLabel = motivos.find(m => m.id === motivoId)?.label ?? outroText;
    const solucao = produto ? (SOLUCOES[produto]?.[motivoId] ?? SOLUCOES[produto]?.outro) : '';
    const checkout = produto ? CHECKOUTS[produto] : null;

    const go = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };

    const step1Valid = produto !== '';
    const step2Valid = motivoId !== '' && (motivoId !== 'outro' || outroText.trim().length >= 3);

    const salvar = async (voltou: boolean) => {
        setEnviando(true);
        try {
            await supabase.from('nps_feedback').insert({
                email: email || null,
                produto,
                nota: null,
                motivo: motivoId === 'outro' ? `Outro: ${outroText}` : motivoLabel,
                comentario: comentario || null,
            });
        } catch (e) { console.error(e); }
        setEnviando(false);
        if (!voltou) setStep(7); // obrigado
    };

    const irCheckout = () => {
        // Salva no Supabase e abre o checkout
        supabase.from('nps_feedback').insert({
            email: email || null,
            produto,
            nota: null,
            motivo: motivoId === 'outro' ? `Outro: ${outroText}` : motivoLabel,
            comentario: 'ACEITOU OFERTA',
        }).then(() => {
            window.open(checkout!.link, '_blank');
        });
    };

    // barra de progresso: steps 1-5 são os "principais"
    const totalVis = 5;
    const prog = Math.min(Math.round((step / totalVis) * 100), 100);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">

            <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 flex flex-col">
                {step < 7 && (
                    <div className="mb-8">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-black rounded-full"
                                initial={{ width: `${Math.max(0, prog - 20)}%` }}
                                animate={{ width: `${prog}%` }}
                                transition={{ duration: 0.4, ease: "easeInOut" }} />
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100">
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* ── 1: PRODUTO ── */}
                            {step === 1 && (
                                <motion.div key="s1" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Sua opinião importa.</h2>
                                        <p className="text-gray-500 text-[15px] leading-relaxed">Queremos entender o que aconteceu com você. Leva menos de 2 minutos.</p>
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
                                        <input type="email" placeholder="seu@email.com" value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="border-0 border-b-2 border-gray-200 pb-2 pt-1 text-[15px] text-gray-900 bg-white placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-colors" />
                                    </div>

                                    <button disabled={!step1Valid} onClick={go}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 2: MOTIVO ── */}
                            {step === 2 && (
                                <motion.div key="s2" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <h2 className="text-2xl font-semibold tracking-tight">O que fez você cancelar o {produto}?</h2>

                                    <div className="flex flex-col gap-2.5">
                                        {motivos.map(m => {
                                            const sel = motivoId === m.id;
                                            return (
                                                <div key={m.id} className="flex flex-col">
                                                    <div onClick={() => setMotivoId(m.id)}
                                                        className={`flex items-center gap-3.5 p-4 rounded-xl cursor-pointer border-2 transition-all ${sel ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                            {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <span className={`text-[14.5px] leading-snug ${sel ? 'font-medium text-black' : 'text-gray-600'}`}>{m.label}</span>
                                                    </div>
                                                    {m.id === 'outro' && sel && (
                                                        <div className="pl-9 pt-2">
                                                            <input type="text" value={outroText} onChange={e => setOutroText(e.target.value)}
                                                                placeholder="Descreva brevemente..."
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none transition-all" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button disabled={!step2Valid} onClick={go}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 3: SOLUÇÃO ── */}
                            {step === 3 && (
                                <motion.div key="s3" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Entendemos o que aconteceu.</h2>
                                        <p className="text-gray-500 text-[15px]">Aqui está o que mudamos desde então:</p>
                                    </div>

                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-[15px] text-gray-900 leading-relaxed">
                                        {solucao}
                                    </div>

                                    <button onClick={go}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all">
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 4: PERGUNTA FECHADA ── */}
                            {step === 4 && (
                                <motion.div key="s4" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">
                                            Se esse problema foi resolvido, você consideraria usar o {produto} novamente?
                                        </h2>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button onClick={go}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all">
                                            Sim, consideraria <ChevronRight size={17} />
                                        </button>
                                        <button onClick={() => setStep(6)}
                                            className="w-full py-4 rounded-xl border-2 border-gray-100 text-gray-500 font-medium hover:border-gray-200 transition-all">
                                            Não por agora
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 5: OFERTA ── */}
                            {step === 5 && checkout && (
                                <motion.div key="s5" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Que ótimo.</h2>
                                        <p className="text-gray-500 text-[15px]">Criamos uma condição especial para quem já foi cliente:</p>
                                    </div>

                                    {/* Card de oferta */}
                                    <div className="border-2 border-black rounded-2xl p-6 flex flex-col gap-3">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{produto}</p>
                                        <div>
                                            <p className="text-5xl font-bold text-black tracking-tight leading-none">{checkout.parcelas.split(' de ')[1]}</p>
                                            <p className="text-gray-500 text-[14px] mt-1">{checkout.parcelas.split(' de ')[0]} · sem juros</p>
                                        </div>
                                        <p className="text-gray-600 text-[14px]">{checkout.descricao}</p>
                                        <button onClick={irCheckout}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all mt-1">
                                            Quero voltar <ArrowRight size={17} />
                                        </button>
                                    </div>

                                    <button onClick={() => setStep(6)}
                                        className="text-gray-400 text-[14px] hover:text-gray-600 transition-colors text-center py-1">
                                        Não, obrigado
                                    </button>
                                </motion.div>
                            )}

                            {/* ── 6: PERGUNTA ABERTA (só quem recusou) ── */}
                            {step === 6 && (
                                <motion.div key="s6" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Tudo bem.</h2>
                                        <p className="text-gray-500 text-[15px]">O que precisaria mudar para você considerar no futuro?</p>
                                    </div>

                                    <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                                        placeholder="Escreva aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[140px] resize-none leading-relaxed" />

                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => salvar(false)} disabled={enviando}
                                            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400">
                                            {enviando ? 'Enviando...' : 'Enviar feedback'}
                                        </button>
                                        <button onClick={() => salvar(false)} disabled={enviando}
                                            className="text-gray-400 text-[14px] hover:text-gray-600 transition-colors py-1">
                                            Pular
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── 7: OBRIGADO ── */}
                            {step === 7 && (
                                <motion.div key="s7" variants={v} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center gap-5 py-10">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={34} className="text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Obrigado pelo feedback!</h2>
                                    <p className="text-gray-500 text-[15px] max-w-sm leading-relaxed">
                                        Sua resposta foi recebida. Cada opinião vai direto para o time de produto.
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-4">
                                        Lumen Apps · Obrigado pelo seu tempo.
                                    </p>
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
