import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

const MOTIVOS_APP = [
    { id: "foq_teste", label: "A Foquinha fica mandando mensagens estranhas de 'Modo Teste'." },
    { id: "foq_lembrete", label: "A Foquinha não tem organizado bem meus compromissos/lembretes." },
    { id: "bora_appstore", label: "O Bora não está na App Store/Play Store (Tive que usar no navegador)." },
    { id: "bora_notificacao", label: "Não recebo notificações das minhas rotinas no Bora." },
    { id: "bora_rotina", label: "O Bora gerou uma rotina que não condiz exatamente com a minha dor real." },
    { id: "tempo", label: "Falta de tempo geral na rotina ou imprevistos financeiros." }
];

const PERGUNTAS_FOLLOWUP: Record<string, string> = {
    "foq_teste": "Poxa, pedimos sinceras desculpas! O WhatsApp atualizou as políticas internas que afetou temporariamente o nosso construtor. A equipe de T.I já resolveu esse bug do modo teste. Sabendo que agora ela voltou a ser a assistente perfeita, você toparia reativá-la?",
    "foq_lembrete": "Qual foi a maior confusão dela? Como nossa I.A aprende com o seu jeito de falar, é provável que precisássemos de apenas mais uns 3 dias para a Foquinha se adaptar perfeitamente a você. Saber disso muda sua decisão de partir?",
    "bora_appstore": "Entendemos perfeitamente essa frustração de usar como 'App de Navegador' (PWA). A boa notícia: estamos em fase avançada de aprovação para lançar nas Lojas Nativas. Se pudesse testar a versão oficial da loja em breve, você reconsideraria cancelar?",
    "bora_notificacao": "As notificações dependem um pouco das configurações do navegador Safari/Chrome em PWA. Uma vez lançado nas lojas em algumas semanas, os Pushs nativos vão saltar na sua tela. Isso ajudaria você a manter o foco?",
    "bora_rotina": "O maior diferencial do Bora é o mapeamento hiperpersonalizado de dores. Se a nossa equipe te ajudasse a resetar o mapeamento e regerar uma trilha cirurgicamente focada no que você quer curar hoje, faria sentido dar uma segunda chance?",
    "tempo": "Sabemos que a vida real atropela nossa organização. O Bora e a Foquinha existem justamente para 'arrumar a casa' e o tempo. Se você tentasse aplicar nem que seja 10% da rotina diária no Bora amanhã, você manteria sua assinatura?",
    "outro": "Entendemos que algo grave quebrou sua expectativa. Sentimos muito, e a sua sinceridade agora é ouro. Pode nos dizer detalhadamente o que deveríamos ter feito de diferente para você ficar?"
};

export default function Reembolsos() {
    useEffect(() => {
        document.title = "Auditoria de Cancelamento - Lumen";
    }, []);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [termoCiencia, setTermoCiencia] = useState(false);
    const [identificacao, setIdentificacao] = useState({ email: '', produto: '' });
    const [motivosSelecionados, setMotivosSelecionados] = useState<string[]>([]);
    const [outroMotivo, setOutroMotivo] = useState('');

    // Follow-up dynamics
    const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
    const [subRespostas, setSubRespostas] = useState<Record<string, string>>({});

    // Final
    const [justificativa, setJustificativa] = useState('');
    const [finalChecks, setFinalChecks] = useState({ c1: false, c2: false, c3: false, c4: false });

    // Validation
    const isStep2Valid = identificacao.email.includes('@') && identificacao.produto;
    const isStep3Valid = motivosSelecionados.length > 0 && (!motivosSelecionados.includes('outro') || outroMotivo.trim().length >= 3);
    const isJustificativaValid = justificativa.length >= 250;
    const isFinalValid = finalChecks.c1 && finalChecks.c2 && finalChecks.c3 && finalChecks.c4;

    const currentMotivoId = motivosSelecionados[currentFollowUpIndex];
    const isSubRespostaValid = currentMotivoId && (subRespostas[currentMotivoId]?.trim().length >= 5);

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step + 1);
    }

    const nextFollowUp = () => {
        if (currentFollowUpIndex < motivosSelecionados.length - 1) {
            setCurrentFollowUpIndex(currentFollowUpIndex + 1);
        } else {
            nextStep();
        }
    }

    const toggleMotivo = (id: string) => {
        setMotivosSelecionados(prev => {
            if (prev.includes(id)) {
                const next = prev.filter(m => m !== id);
                return next;
            }
            return [...prev, id];
        });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        alert("Para fins de auditoria, a justificativa deve ser digitada manualmente.");
    };

    const submitAuditoria = async () => {
        setIsSubmitting(true);

        const formatMotivoLabel = (id: string) => {
            if (id === 'outro') return `Outro: ${outroMotivo}`;
            return MOTIVOS_APP.find(m => m.id === id)?.label || id;
        };

        const motivoFinal = motivosSelecionados.map(formatMotivoLabel).join(' | ');
        const subRespostasFinal = motivosSelecionados.map(id => `[${formatMotivoLabel(id)}]: ${subRespostas[id] || 'Sem resposta'}`).join('\n\n');

        try {
            const { error } = await supabase.from('auditoria_reembolsos').insert({
                email: identificacao.email,
                produto: identificacao.produto,
                transacao_id: 'Não exigida',
                motivo_principal: motivoFinal,
                sub_resposta: subRespostasFinal,
                justificativa_detalhada: justificativa
            });

            if (error) {
                console.error("Erro no Supabase:", error);
                alert("Ocorreu um erro técnico na rede. Tente novamente mais tarde.");
                setIsSubmitting(false);
                return;
            }

            setStep(7);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-gray-200">
            {/* Header */}
            <header className="bg-black text-white py-6 flex justify-center items-center shadow-lg z-10 sticky top-0">
                <h1 className="text-xl tracking-[0.2em] font-light">LUMEN</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 md:py-16 flex flex-col">

                {/* Progress Bar */}
                {step < 7 && (
                    <div className="mb-10 animate-in fade-in duration-500">
                        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1 tracking-wider uppercase">
                            <span>Auditoria do Sistema</span>
                            <span>{step} de 6</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black rounded-full"
                                initial={{ width: `${((step - 1) / 6) * 100}%` }}
                                animate={{ width: `${(step / 6) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-10">
                        <AnimatePresence mode="wait">

                            {/* --- STEP 1 --- */}
                            {step === 1 && (
                                <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div className="flex items-center gap-3 text-red-600 mb-2">
                                        <ShieldAlert size={28} />
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Análise de Qualidade</h2>
                                    </div>

                                    <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
                                        <p>
                                            A Lumen investe pesado em tecnologia de automação inteligente (Bora/Foquinha). Entendemos que ferramentas robustas exigem alinhamento de expectativas. Ao prosseguir com a declaração de estorno, nós garantimos a devolução seguindo as diretrizes legais da plataforma de pagamento.
                                        </p>
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                            <p>
                                                Nosso sistema submete todos os relatórios abaixo à uma auditoria manual cruzada com os dados de uso do App no seu e-mail. Gostaríamos de pontuar que, em casos identificados de <strong>abuso das políticas, fraude ou má-fé pós-utilização intensiva</strong>, nos reservamos o direito contratual de suspender permanentemente esse CPF/E-mail do ecossistema de software da Lumen.
                                            </p>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-4 p-4 mt-2 cursor-pointer group hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                                        <div className="mt-1 flex-shrink-0">
                                            <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer rounded" checked={termoCiencia} onChange={(e) => setTermoCiencia(e.target.checked)} />
                                        </div>
                                        <span className="text-gray-700 font-medium leading-snug">
                                            Compreendo as políticas de má-fé e de estorno da plataforma, e desejo prosseguir com a justificativa técnica.
                                        </span>
                                    </label>

                                    <button disabled={!termoCiencia} onClick={nextStep} className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black focus:ring-4 focus:ring-gray-200">
                                        Avançar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 2 --- */}
                            {step === 2 && (
                                <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Identificação</h2>
                                        <p className="text-gray-500">Vamos localizar sua licença do aplicativo.</p>
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-black">E-mail utilizado na compra/acesso da ferramenta</label>
                                            <input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={identificacao.email}
                                                onChange={(e) => setIdentificacao({ ...identificacao, email: e.target.value })}
                                                className="w-full bg-transparent border-0 border-b-2 border-gray-200 px-0 py-3 text-[15px] text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:border-black transition-colors outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-4">Qual ferramenta apresentou atrito?</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Bora', 'Foquinha'].map(prod => (
                                                    <label key={prod} className={`flex items-center justify-center py-4 rounded-xl border-2 cursor-pointer transition-all ${identificacao.produto === prod ? 'border-black bg-gray-50 text-black font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'border-gray-100 hover:border-gray-200 text-gray-500 bg-white'}`}>
                                                        <input type="radio" className="sr-only" checked={identificacao.produto === prod} onChange={() => setIdentificacao({ ...identificacao, produto: prod })} />
                                                        {prod}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button disabled={!isStep2Valid} onClick={nextStep} className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black">
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 3 --- */}
                            {step === 3 && (
                                <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Por que a ferramenta falhou para você?</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">Nós otimizamos o software semanalmente. Selecione a(s) maior(es) pedra(s) no sapato que impediram sua escala.</p>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        {MOTIVOS_APP.map((m) => {
                                            const isSelected = motivosSelecionados.includes(m.id);
                                            return (
                                                <div
                                                    key={m.id}
                                                    onClick={() => toggleMotivo(m.id)}
                                                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-4 ${isSelected ? 'border-black bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                    </div>
                                                    <span className={`text-[15px] leading-snug ${isSelected ? 'font-medium text-black' : 'text-gray-600'}`}>{m.label}</span>
                                                </div>
                                            );
                                        })}

                                        {/* "Outro" Custom Option */}
                                        <div
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-4 ${motivosSelecionados.includes('outro') ? 'border-black bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleMotivo('outro')}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${motivosSelecionados.includes('outro') ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                    {motivosSelecionados.includes('outro') && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <span className={`text-[15px] ${motivosSelecionados.includes('outro') ? 'font-medium text-black' : 'text-gray-600'}`}>Tive um problema completamente diferente.</span>
                                            </div>

                                            {motivosSelecionados.includes('outro') && (
                                                <div className="pl-9 pb-1">
                                                    <input
                                                        type="text"
                                                        value={outroMotivo}
                                                        onChange={(e) => setOutroMotivo(e.target.value)}
                                                        placeholder="Sintetize em 3 palavras no máximo..."
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all shadow-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button disabled={!isStep3Valid} onClick={nextStep} className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black">
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 4 (DYNAMIC FOLLOW-UPS) --- */}
                            {step === 4 && currentMotivoId && (
                                <motion.div key={`step4-${currentMotivoId}`} variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Um passo atrás...</h2>
                                            {motivosSelecionados.length > 1 && (
                                                <span className="text-xs font-bold text-gray-400">Pergunta {currentFollowUpIndex + 1} de {motivosSelecionados.length}</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            Precisamos isolar a fricção no seu caso para evoluirmos na Engenharia de Software e te ampararmos corretamente:
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-[15px] leading-relaxed font-medium text-gray-800 shadow-inner">
                                        {PERGUNTAS_FOLLOWUP[currentMotivoId] || PERGUNTAS_FOLLOWUP['outro']}
                                    </div>

                                    <textarea
                                        value={subRespostas[currentMotivoId] || ''}
                                        onChange={(e) => setSubRespostas(prev => ({ ...prev, [currentMotivoId]: e.target.value }))}
                                        placeholder="Sua resposta franca aqui. Detalhes são sempre bem-vindos..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[140px] resize-y shadow-sm"
                                    />

                                    <button disabled={!isSubRespostaValid} onClick={nextFollowUp} className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black">
                                        {currentFollowUpIndex < motivosSelecionados.length - 1 ? 'Próxima Questão' : 'Continuar'} <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 5 --- */}
                            {step === 5 && (
                                <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Ato Final</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            Obrigado por nos situar. Por fim, explique detalhadamente a soma de fatores que gerou sua decisão de arquivar o software.
                                        </p>
                                    </div>

                                    <div className="relative mt-2">
                                        <textarea
                                            value={justificativa}
                                            onChange={(e) => setJustificativa(e.target.value)}
                                            onPaste={handlePaste}
                                            placeholder="Detalhe todo o seu processo, sua operação atual, os gargalos e o motivo real por trás dessa solicitação. A área de T.I revisará pessoalmente (Mínimo de 250 letras)..."
                                            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[220px] pb-10 resize-none leading-relaxed shadow-sm"
                                        />
                                        <div className={`absolute bottom-4 right-5 text-xs font-bold px-2 py-1 rounded bg-gray-50 ${justificativa.length >= 250 ? 'text-green-600' : 'text-red-500'}`}>
                                            {justificativa.length} / 250
                                        </div>
                                    </div>

                                    <button disabled={!isJustificativaValid} onClick={nextStep} className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black">
                                        Avançar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 6 --- */}
                            {step === 6 && (
                                <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Assinatura de Retirada</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            A equipe receberá seu laudo na mesa de auditoria. Para consumar o pedido na gateway, marque seu aval nos protocolos finais:
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'c1', text: "Declaro que interrompi os testes com a plataforma, e não reterei qualquer ativo gerado por automações nossas na má-fé." },
                                            { key: 'c2', text: "O prazo base de conferência dos logs da base de dados e de resposta da equipe é de até 48 horas úteis." },
                                            { key: 'c3', text: "O estorno é processado e liquidado pela operadora do cartão/banco, e pode cair entre 1 a 2 faturas subsequentes (Cartão)." },
                                            { key: 'c4', text: "Compreendo e aceito a política rigorosa de suspensão do meu cadastro, caso constatados abusos nesta solicitação." }
                                        ].map((check) => (
                                            <label key={check.key} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${finalChecks[check.key as keyof typeof finalChecks] ? 'border-gray-300 bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}>
                                                <div className="mt-0.5 flex-shrink-0">
                                                    <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer rounded" checked={finalChecks[check.key as keyof typeof finalChecks]} onChange={(e) => setFinalChecks(prev => ({ ...prev, [check.key]: e.target.checked }))} />
                                                </div>
                                                <span className={`text-[14px] leading-snug ${finalChecks[check.key as keyof typeof finalChecks] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{check.text}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <button disabled={!isFinalValid || isSubmitting} onClick={submitAuditoria} className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black relative overflow-hidden">
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Emitindo Laudo...
                                            </div>
                                        ) : (
                                            "Finalizar Solicitação e Auditar"
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 7: SUCCESS --- */}
                            {step === 7 && (
                                <motion.div key="step7" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center gap-6 py-10 md:py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                                        <CheckCircle2 size={40} className="text-green-600" />
                                    </div>

                                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Ocorrência Protocolada</h2>

                                    <div className="flex flex-col gap-4 text-gray-500 max-w-md mx-auto text-[15px] leading-relaxed">
                                        <p>
                                            O seu formulário extenso de rescisão e depoimento técnico foram fixados no painel interno.
                                        </p>
                                        <p>
                                            Nossa área de T.I cruza os dados nos logs do seu e-mail de acesso. Confirmando a aderência aos termos, retornaremos um protocolo oficial (ou Pix imediato) via <strong>E-mail/WhatsApp</strong> dentro de 48 horas úteis.
                                        </p>
                                    </div>

                                    <div className="mt-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                        Lumen Audit System
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-10 mb-4 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Lumen Systems. Todos os direitos reservados.
                </footer>
            </main>
        </div>
    );
}
