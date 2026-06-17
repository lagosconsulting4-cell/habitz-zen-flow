import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, ArrowRight, CheckCircle2, CheckCheck } from 'lucide-react';

// ─── MOTIVOS FILTRADOS POR PRODUTO ────────────────────────────────────────────

const MOTIVOS_BORA = [
    { id: "bora_rotina", label: "O Bora gerou uma rotina que não se encaixou no meu dia a dia." },
    { id: "bora_notificacao", label: "Não recebia notificações para seguir minha rotina." },
    { id: "bora_appstore", label: "Esperava um app nativo (App Store/Play Store), não um app de navegador." },
    { id: "tempo", label: "Falta de tempo ou questões financeiras no momento." },
    { id: "outro", label: "Outro motivo." },
];

const MOTIVOS_FOQUINHA = [
    { id: "foq_teste", label: "A Foquinha ficou mandando mensagens estranhas de 'Modo Teste'." },
    { id: "foq_lembrete", label: "Ela não organizou meus lembretes da forma que eu esperava." },
    { id: "foq_aprendizado", label: "Demorou para aprender meu jeito de falar e me frustrei." },
    { id: "tempo", label: "Falta de tempo ou questões financeiras no momento." },
    { id: "outro", label: "Outro motivo." },
];

// ─── PROPOSTAS CONCRETAS DE RETENÇÃO ──────────────────────────────────────────

const PROPOSTAS: Record<string, string> = {
    "bora_rotina": "Sabia que você pode <strong>resetar o mapeamento do Bora</strong> e gerar uma nova rotina do zero? Nosso suporte faz isso para você em 5 minutos, sem nenhum custo adicional.",
    "bora_notificacao": "As notificações no PWA dependem de uma configuração simples do navegador que 90% dos usuários não ativam. Nosso suporte resolve isso em menos de 10 minutos. <span class=\"font-semibold text-indigo-600\">Vale tentar antes de cancelar?</span>",
    "bora_appstore": "O Bora foi feito pra rodar direto no navegador: você <strong>instala na tela inicial em 10 segundos e usa como um app</strong> — sem depender de loja, sem ocupar espaço e atualizando sozinho. Se você cancelar agora, perde o preço de cofundador. <span class=\"font-semibold text-indigo-600\">Posso te mostrar como deixar igual a um app?</span>",
    "foq_teste": "O bug do 'Modo Teste' foi causado por uma atualização do WhatsApp que afetou temporariamente nossa API. <strong>Já foi corrigido.</strong> <span class=\"font-semibold text-indigo-600\">Quer que a gente reative sua Foquinha agora?</span>",
    "foq_lembrete": "A Foquinha aprende com o seu jeito de escrever. Na primeira semana ela ainda está se calibrando. <span class=\"font-semibold text-indigo-600\">Com mais 3 dias de uso, a maioria dos usuários já sente a diferença. Quer tentar esse tempo?</span>",
    "foq_aprendizado": "Cada pessoa tem um estilo. Nossa equipe pode <strong>recalibrar a IA da sua Foquinha pessoalmente</strong>, sem custo adicional. <span class=\"font-semibold text-indigo-600\">Quer agendar isso antes de decidir?</span>",
    "tempo": "Você sabia que pode <strong>pausar sua assinatura</strong> em vez de cancelar? Assim você preserva o acesso, o preço de cofundador, e retoma quando quiser. <span class=\"font-semibold text-indigo-600\">Essa opção faz mais sentido para a sua situação?</span>",
    "outro": "Sentimos muito que não detectamos isso antes. <span class=\"font-semibold text-indigo-600\">Pode nos contar o que aconteceu? Queremos resolver, não apenas protocolar.</span>",
};

// ─── ANIMAÇÕES ────────────────────────────────────────────────────────────────

const variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
} as const;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Reembolsos() {
    useEffect(() => { document.title = "Cancelamento — Lumen Apps"; }, []);




    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States
    const [termoCiencia, setTermoCiencia] = useState(false);
    const [identificacao, setIdentificacao] = useState({ email: '', produto: '' });
    const [motivosSelecionados, setMotivosSelecionados] = useState<string[]>([]);
    const [outroMotivo, setOutroMotivo] = useState('');
    const [followUpIndex, setFollowUpIndex] = useState(0);
    const [ficou, setFicou] = useState(false);
    const [justificativa, setJustificativa] = useState('');
    const [checks, setChecks] = useState({ c1: false, c2: false, c3: false });

    // Motivos filtrados pelo produto
    const motivosDoproduto = identificacao.produto === 'Foquinha' ? MOTIVOS_FOQUINHA : MOTIVOS_BORA;

    // Validações
    const step2Valid = identificacao.email.includes('@') && identificacao.produto !== '';
    const step3Valid = motivosSelecionados.length > 0 && (!motivosSelecionados.includes('outro') || outroMotivo.trim().length >= 3);
    const currentMotivoId = motivosSelecionados[followUpIndex];
    const justificativaValid = justificativa.length >= 100;
    const checksValid = checks.c1 && checks.c2 && checks.c3;

    // Navegação
    const goNext = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setStep(s => s + 1); };

    const handleNextFollowUp = () => {
        if (followUpIndex < motivosSelecionados.length - 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setFollowUpIndex(i => i + 1);
        } else {
            goNext();
        }
    };

    const handleFicou = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFicou(true);
    };

    const toggleMotivo = (id: string) => {
        setMotivosSelecionados(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
    };

    // Submissão
    const submit = async () => {
        setIsSubmitting(true);

        const getLabel = (id: string) =>
            id === 'outro' ? `Outro: ${outroMotivo}` : motivosDoProduct().find(m => m.id === id)?.label || id;

        const motivoFinal = motivosSelecionados.map(getLabel).join(' | ');

        try {
            const { error } = await supabase.from('auditoria_reembolsos').insert({
                email: identificacao.email,
                produto: identificacao.produto,
                transacao_id: 'Não exigida',
                motivo_principal: motivoFinal,
                sub_resposta: null,
                justificativa_detalhada: justificativa
            });
            if (error) { console.error(error); setIsSubmitting(false); return; }
            setStep(7);
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    // Dupliquei pra não usar closure stale dentro de submit
    function motivosDoProduct() {
        return identificacao.produto === 'Foquinha' ? MOTIVOS_FOQUINHA : MOTIVOS_BORA;
    }

    const totalSteps = 6;
    const progress = Math.round((step / totalSteps) * 100);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">

            <main className="flex-1 w-full max-w-xl mx-auto px-4 py-12 flex flex-col">

                {/* Barra de Progresso */}
                {step < 7 && (
                    <div className="mb-8">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black rounded-full"
                                initial={{ width: `${Math.round(((step - 1) / totalSteps) * 100)}%` }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.45, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100">
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* ── STEP 1: ACOLHIMENTO ── */}
                            {step === 1 && (
                                <motion.div key="s1" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div className="flex items-center gap-3">
                                        <HeartHandshake size={26} className="text-gray-400 flex-shrink-0" />
                                        <h2 className="text-2xl font-semibold tracking-tight">Entendemos que nem sempre dá certo.</h2>
                                    </div>

                                    <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
                                        <p>
                                            Antes de prosseguir, queremos que você saiba: o seu pedido será analisado com atenção real, por uma pessoa real. Processamos reembolsos sem burocracia.
                                        </p>
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-[14px]">
                                            Apenas pedimos reciprocidade: em casos comprovados de uso predatório das ferramentas seguido de cancelamento imediato por má-fé, o acesso ao ecossistema Lumen é encerrado permanentemente.
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 w-5 h-5 accent-black cursor-pointer flex-shrink-0"
                                            checked={termoCiencia}
                                            onChange={e => setTermoCiencia(e.target.checked)}
                                        />
                                        <span className="text-[14px] text-gray-700 leading-snug">
                                            Entendo. Quero prosseguir com o pedido.
                                        </span>
                                    </label>

                                    <button
                                        disabled={!termoCiencia}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Avançar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 2: IDENTIFICAÇÃO ── */}
                            {step === 2 && (
                                <motion.div key="s2" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Qual ferramenta não te atendeu?</h2>
                                        <p className="text-gray-500 text-[15px]">Vamos localizar o seu acesso nos nossos sistemas.</p>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">E-mail de acesso</label>
                                            <input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={identificacao.email}
                                                onChange={e => setIdentificacao({ ...identificacao, email: e.target.value })}
                                                className="border-0 border-b-2 border-gray-200 pb-2 pt-1 text-[15px] text-gray-900 placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-colors bg-white"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="text-sm font-semibold text-gray-700">Produto</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Bora', 'Foquinha'].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setIdentificacao({ ...identificacao, produto: p })}
                                                        className={`py-4 rounded-xl border-2 font-medium text-[15px] transition-all ${identificacao.produto === p ? 'border-black bg-gray-50 text-black' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={!step2Valid}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Continuar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 3: MOTIVOS (filtrado) ── */}
                            {step === 3 && (
                                <motion.div key="s3" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <h2 className="text-2xl font-semibold tracking-tight">O que pesou mais na sua decisão?</h2>

                                    <div className="flex flex-col gap-2.5">
                                        {motivosDoProduct().map(m => {
                                            const sel = motivosSelecionados.includes(m.id);
                                            return (
                                                <div key={m.id} className="flex flex-col">
                                                    <div
                                                        onClick={() => toggleMotivo(m.id)}
                                                        className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${sel ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                            {sel && <CheckCircle2 size={13} className="text-white" />}
                                                        </div>
                                                        <span className={`text-[14.5px] leading-snug ${sel ? 'font-medium text-black' : 'text-gray-600'}`}>
                                                            {m.label}
                                                        </span>
                                                    </div>

                                                    {/* Campo extra para "Outro" */}
                                                    {m.id === 'outro' && sel && (
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

                            {/* ── STEP 4: PROPOSTAS DE RETENÇÃO ── */}
                            {step === 4 && currentMotivoId && (
                                <motion.div key={`s4-${currentMotivoId}`} variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h2 className="text-2xl font-semibold tracking-tight">Antes de ir...</h2>
                                            {motivosSelecionados.length > 1 && (
                                                <span className="text-xs font-semibold text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-full">
                                                    {followUpIndex + 1} de {motivosSelecionados.length}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-[15px]">Temos uma proposta para o que você relatou:</p>
                                    </div>

                                    {/* Box da proposta */}
                                    <div
                                        className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-[15px] text-gray-900 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: PROPOSTAS[currentMotivoId] || PROPOSTAS['outro'] }}
                                    />

                                    {/* Botões de decisão */}
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleFicou}
                                            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all"
                                        >
                                            Quero ficar <CheckCircle2 size={17} />
                                        </button>
                                        <button
                                            onClick={handleNextFollowUp}
                                            className="w-full py-4 rounded-xl border-2 border-gray-100 text-gray-500 font-medium hover:border-gray-200 transition-all"
                                        >
                                            {followUpIndex < motivosSelecionados.length - 1 ? 'Ver próxima proposta' : 'Seguir com o cancelamento'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}


                            {/* ── STEP 5: JUSTIFICATIVA LIVRE ── */}
                            {step === 5 && (
                                <motion.div key="s5" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Por último, nos conte com suas palavras.</h2>
                                        <p className="text-gray-500 text-[15px] leading-relaxed">
                                            Não tem resposta certa ou errada. O que você escrever vai ser lido pela nossa equipe e vai ajudar a melhorar o produto.
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={justificativa}
                                            onChange={e => setJustificativa(e.target.value)}
                                            onPaste={handlePaste}
                                            placeholder="Escreva aqui..."
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[14.5px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[200px] resize-none leading-relaxed pb-8"
                                        />
                                        <span className={`absolute bottom-3 right-4 text-xs font-bold ${justificativa.length >= 100 ? 'text-green-600' : 'text-red-400'}`}>
                                            {justificativa.length} / 100
                                        </span>
                                    </div>

                                    <button
                                        disabled={!justificativaValid}
                                        onClick={goNext}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Finalizar <ArrowRight size={17} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 6: CONFIRMAÇÕES ── */}
                            {step === 6 && (
                                <motion.div key="s6" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-7">
                                    <div>
                                        <h2 className="text-2xl font-semibold tracking-tight mb-1">Só mais duas confirmações:</h2>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'c1', text: "Estou ciente de que não reterei acesso nem usarei dados da plataforma após o cancelamento." },
                                            { key: 'c2', text: "Entendo que o processamento do estorno no cartão pode levar de 1 a 2 faturas." },
                                            { key: 'c3', text: "Concordo que a equipe da Lumen poderá entrar em contato comigo em até 48h para confirmar os dados." }
                                        ].map(({ key, text }) => {
                                            const checked = checks[key as keyof typeof checks];
                                            return (
                                                <label key={key} className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${checked ? 'border-gray-300 bg-gray-50' : 'border-gray-100 hover:bg-gray-50/50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="mt-0.5 w-5 h-5 accent-black cursor-pointer flex-shrink-0"
                                                        checked={checked}
                                                        onChange={e => setChecks(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    />
                                                    <span className={`text-[14px] leading-snug ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={!checksValid || isSubmitting}
                                        onClick={submit}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>Confirmar Pedido de Reembolso <CheckCheck size={17} /></>
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 7: SUCESSO ── */}
                            {step === 7 && (
                                <motion.div key="s7" variants={variants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center gap-5 py-10">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                                        <CheckCircle2 size={34} className="text-green-500" />
                                    </div>

                                    <h2 className="text-2xl font-semibold tracking-tight">Pedido recebido com carinho.</h2>

                                    <div className="text-gray-500 text-[15px] leading-relaxed max-w-sm space-y-3">
                                        <p>Sua mensagem chegou. Prometemos que alguém da nossa equipe vai ler tudo que você escreveu.</p>
                                        <p>Você receberá uma confirmação por <strong className="text-gray-700">e-mail em até 48 horas úteis</strong> com as próximas etapas do seu estorno.</p>
                                        <p>Se mudar de ideia antes disso, é só responder o e-mail.</p>
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

            {/* ── MODAL DE RETENÇÃO ── */}
            <AnimatePresence>
                {ficou && (
                    <motion.div
                        key="modal-ficou"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-5"
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                <CheckCircle2 size={34} className="text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight mb-1">Obrigado por confiar na gente.</h2>
                                <p className="text-gray-500 text-[15px] leading-relaxed">
                                    Estamos aqui para continuar te ajudando.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 w-full">
                                <a
                                    href={(() => {
                                        const getLabel = (id: string) =>
                                            id === 'outro'
                                                ? outroMotivo || 'Outro'
                                                : motivosDoProduct().find(m => m.id === id)?.label || id;
                                        const motivos = motivosSelecionados.map(getLabel).join('; ');
                                        const msg = `Olá! Quero continuar com o ${identificacao.produto || 'app'} 👋\n\nMotivo que me fez querer cancelar: ${motivos}\n\nPreciso de ajuda para resolver isso.`;
                                        return `https://wa.me/5511993371766?text=${encodeURIComponent(msg)}`;
                                    })()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all"
                                >
                                    Falar com o suporte
                                </a>
                                <button
                                    onClick={() => window.close()}
                                    className="w-full py-4 rounded-xl border-2 border-gray-100 text-gray-500 font-medium hover:border-gray-200 transition-all"
                                >
                                    Fechar esta aba
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
