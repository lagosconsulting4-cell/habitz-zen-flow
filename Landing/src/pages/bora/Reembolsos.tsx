import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Reembolsos() {
    useEffect(() => {
        document.title = "Auditoria de Cancelamento - Lumen";
    }, []);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [termoCiencia, setTermoCiencia] = useState(false);
    const [identificacao, setIdentificacao] = useState({ email: '', produto: '', transacaoId: 'Não exigido' });
    const [motivosSelecionados, setMotivosSelecionados] = useState<string[]>([]);
    const [outroMotivo, setOutroMotivo] = useState('');
    const [subResposta, setSubResposta] = useState('');
    const [justificativa, setJustificativa] = useState('');

    // Final Checks
    const [finalCheck1, setFinalCheck1] = useState(false);
    const [finalCheck2, setFinalCheck2] = useState(false);
    const [finalCheck3, setFinalCheck3] = useState(false);
    const [finalCheck4, setFinalCheck4] = useState(false);

    // Validation
    const isStep2Valid = identificacao.email.includes('@') && identificacao.produto;
    const isStep3Valid = motivosSelecionados.length > 0 && (!motivosSelecionados.includes('Outro') || outroMotivo.length >= 3);
    const isJustificativaValid = justificativa.length >= 250;
    const isFinalValid = finalCheck1 && finalCheck2 && finalCheck3 && finalCheck4;

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step + 1);
    }

    const toggleMotivo = (motivo: string) => {
        setMotivosSelecionados(prev => prev.includes(motivo) ? prev.filter(m => m !== motivo) : [...prev, motivo]);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        alert("Para fins de auditoria, a justificativa deve ser digitada manualmente.");
    };

    const submitAuditoria = async () => {
        setIsSubmitting(true);
        const motivoFinal = motivosSelecionados.join(', ') + (motivosSelecionados.includes('Outro') ? ` - Específico: ${outroMotivo}` : '');
        try {
            const { error } = await supabase.from('auditoria_reembolsos').insert({
                email: identificacao.email,
                produto: identificacao.produto,
                transacao_id: 'Não exigida',
                motivo_principal: motivoFinal,
                sub_resposta: subResposta,
                justificativa_detalhada: justificativa
            });

            if (error) {
                console.error("Erro no Supabase:", error);
                alert("Ocorreu um erro técnico ao processar a auditoria. Tente novamente mais tarde.");
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

                {/* Progress Bar (Hidden on success) */}
                {step < 7 && (
                    <div className="mb-10 animate-in fade-in duration-500">
                        <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1 tracking-wider uppercase">
                            <span>Auditoria</span>
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
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Desligamento de Ecossistema</h2>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed text-[15px]">
                                        A Lumen investe pesado em tecnologia e suporte para quem deseja escalar resultados. Ao prosseguir com o pedido de reembolso, você está ciente de que esta ação é considerada uma quebra de confiança com o ecossistema.
                                    </p>
                                    <p className="text-gray-600 leading-relaxed text-[15px] p-4 bg-red-50 rounded-xl border border-red-100">
                                        Isso resultará na <strong>suspensão imediata e permanente</strong> do seu CPF/E-mail para futuras compras, atualizações ou novos lançamentos da Lumen (Bora, Foquinha, LOTER.IA e projetos futuros).
                                    </p>

                                    <label className="flex items-start gap-4 p-4 mt-4 cursor-pointer group hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                                        <div className="mt-1 flex-shrink-0">
                                            <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer rounded" checked={termoCiencia} onChange={(e) => setTermoCiencia(e.target.checked)} />
                                        </div>
                                        <span className="text-gray-700 font-medium leading-snug">
                                            Compreendo o risco de banimento permanente e desejo prosseguir com a auditoria manual.
                                        </span>
                                    </label>

                                    <button disabled={!termoCiencia} onClick={nextStep} className="mt-6 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black focus:ring-4 focus:ring-gray-200">
                                        Avançar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 2 --- */}
                            {step === 2 && (
                                <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Identificação</h2>
                                        <p className="text-gray-500">Por favor, confirme os dados da sua compra.</p>
                                    </div>

                                    <div className="flex flex-col gap-8">
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-black">E-mail utilizado na compra</label>
                                            <input
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={identificacao.email}
                                                onChange={(e) => setIdentificacao({ ...identificacao, email: e.target.value })}
                                                className="w-full bg-transparent border-0 border-b-2 border-gray-200 px-0 py-3 text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:border-black transition-colors outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-4">Produto que deseja cancelar</label>
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
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Por que você está partindo?</h2>
                                        <p className="text-gray-500">Selecione uma ou mais razões que o impedem de continuar.</p>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        {[
                                            "Achei o processo muito complexo / Não consegui configurar.",
                                            "Não tenho tempo suficiente para aplicar o método.",
                                            "Achei que o resultado financeiro seria imediato.",
                                            "Bug Técnico / App travou.",
                                            "Imprevistos Financeiros e Pessoais."
                                        ].map((motivo) => {
                                            const isSelected = motivosSelecionados.includes(motivo);
                                            return (
                                                <div
                                                    key={motivo}
                                                    onClick={() => toggleMotivo(motivo)}
                                                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-4 ${isSelected ? 'border-black bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                        {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                    </div>
                                                    <span className={`text-[15px] ${isSelected ? 'font-medium text-black' : 'text-gray-600'}`}>{motivo}</span>
                                                </div>
                                            );
                                        })}

                                        {/* "Outro" Custom Option */}
                                        <div
                                            onClick={() => toggleMotivo('Outro')}
                                            className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex flex-col gap-4 ${motivosSelecionados.includes('Outro') ? 'border-black bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${motivosSelecionados.includes('Outro') ? 'bg-black border-black' : 'border-gray-300'}`}>
                                                    {motivosSelecionados.includes('Outro') && <CheckCircle2 size={14} className="text-white" />}
                                                </div>
                                                <span className={`text-[15px] ${motivosSelecionados.includes('Outro') ? 'font-medium text-black' : 'text-gray-600'}`}>Outro motivo específico</span>
                                            </div>

                                            {motivosSelecionados.includes('Outro') && (
                                                <div className="pl-9 pb-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={outroMotivo}
                                                        onChange={(e) => setOutroMotivo(e.target.value)}
                                                        placeholder="Por exemplo, tive a conta suspensa..."
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

                            {/* --- STEP 4 --- */}
                            {step === 4 && (
                                <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-8">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Poderia nos explicar?</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            Percebemos que sua jornada não saiu como planejada. Para podermos te auxiliar ou concluir de vez sua rescisão, responda com sinceridade o principal ponto abaixo:
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col gap-4 text-[15px] font-medium text-gray-800 shadow-inner">
                                        {motivosSelecionados.some(m => m.includes("complexo")) && (
                                            <p>Você chegou a tentar contato com nosso suporte técnico para que pudéssemos te ajudar na configuração inicial?</p>
                                        )}
                                        {motivosSelecionados.some(m => m.includes("tempo")) && (
                                            <p>O aplicativo pode ser executado em 15 minutos. Você diria que não conseguiu encaixar esse tempo na rotina, ou acabou priorizando outras tarefas por falta de direcionamento nosso?</p>
                                        )}
                                        {motivosSelecionados.some(m => m.includes("imediato")) && (
                                            <p>Na construção de um canal, consistência é tudo. Você conseguiu realizar as postagens de forma ininterrupta nos últimos 15 dias?</p>
                                        )}
                                        {motivosSelecionados.some(m => m.includes("Bug")) && (
                                            <p>Sentimos muito pela frustração! Em qual funcionalidade a ferramenta travou para você? Isso limitou completamente sua conta?</p>
                                        )}
                                        {(motivosSelecionados.some(m => m.includes("Financeiros")) || motivosSelecionados.includes("Outro")) && (
                                            <p>Entendemos perfeitamente o seu lado. Você precisou paralisar agora, mas cogita voltar a validar a estratégia no futuro?</p>
                                        )}
                                    </div>

                                    <textarea
                                        value={subResposta}
                                        onChange={(e) => setSubResposta(e.target.value)}
                                        placeholder="Sua resposta franca aqui..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[120px] resize-y shadow-sm"
                                    />

                                    <button disabled={subResposta.length < 5} onClick={nextStep} className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black">
                                        Continuar <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* --- STEP 5 --- */}
                            {step === 5 && (
                                <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Seu feedback final</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            Valorizamos muito os comentários. Poderia nos explicar detalhadamente qual foi o seu principal obstáculo? Sua resposta é analisada diretamente pela equipe.
                                        </p>
                                    </div>

                                    <div className="relative mt-2">
                                        <textarea
                                            value={justificativa}
                                            onChange={(e) => setJustificativa(e.target.value)}
                                            onPaste={handlePaste}
                                            placeholder="Conte-nos o que houve em detalhes. O que faltou para o sucesso da jornada?"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all min-h-[200px] pb-10 resize-none leading-relaxed shadow-sm"
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
                                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">Assinatura de Rescisão</h2>
                                        <p className="text-gray-500 leading-relaxed text-[15px]">
                                            Sua solicitação será encaminhada para nossa análise de qualidade. Para finalizar, confirme seu reconhecimento aos termos de quebra do serviço:
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {[
                                            { state: finalCheck1, setter: setFinalCheck1, text: "Confirmo que todos os meus dados e históricos serão apagados permanentemente." },
                                            { state: finalCheck2, setter: setFinalCheck2, text: "O prazo de análise e resposta da equipe é de até 48 horas úteis." },
                                            { state: finalCheck3, setter: setFinalCheck3, text: "O estorno depende da operadora e pode levar de 1 a 2 faturas." },
                                            { state: finalCheck4, setter: setFinalCheck4, text: "Aceito a suspensão da minha conta em futuros produtos da Lumen." }
                                        ].map((check, idx) => (
                                            <label key={idx} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${check.state ? 'border-gray-300 bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}>
                                                <div className="mt-0.5 flex-shrink-0">
                                                    <input type="checkbox" className="w-5 h-5 accent-black cursor-pointer rounded" checked={check.state} onChange={(e) => check.setter(e.target.checked)} />
                                                </div>
                                                <span className={`text-[14px] leading-snug ${check.state ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{check.text}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <button disabled={!isFinalValid || isSubmitting} onClick={submitAuditoria} className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-30 disabled:hover:bg-black relative overflow-hidden">
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando ao Conselho...
                                            </div>
                                        ) : (
                                            "Finalizar Solicitação"
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

                                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Solicitação Recebida</h2>

                                    <div className="flex flex-col gap-4 text-gray-500 max-w-md mx-auto text-[15px] leading-relaxed">
                                        <p>
                                            O seu relatório de rescisão foi enviado diretamente para a nossa equipe de retenção e qualidade.
                                        </p>
                                        <p>
                                            Para que possamos compreender sua frustração da melhor forma, avaliaremos manualmente as informações enviadas e entraremos em contato via e-mail ou WhatsApp em um prazo máximo de <strong>48 horas úteis</strong>.
                                        </p>
                                    </div>

                                    <div className="mt-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                        Mesa de Auditoria Lumen
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-10 mb-4 text-center text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Lumen. Todos os direitos reservados.
                </footer>
            </main>
        </div>
    );
}
