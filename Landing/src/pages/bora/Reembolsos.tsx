import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export default function Reembolsos() {
    useEffect(() => {
        document.title = "Auditoria de Cancelamento - Lumen";
    }, []);

    const [step, setStep] = useState(1);

    // States do Formulário
    const [termoCiencia, setTermoCiencia] = useState(false);
    const [identificacao, setIdentificacao] = useState({ email: '', produto: '', transacaoId: 'Não exigido' });
    const [motivosSelecionados, setMotivosSelecionados] = useState<string[]>([]);
    const [outroMotivo, setOutroMotivo] = useState('');
    const [subResposta, setSubResposta] = useState('');
    const [justificativa, setJustificativa] = useState('');

    // States Aversao a perda final
    const [finalCheck1, setFinalCheck1] = useState(false);
    const [finalCheck2, setFinalCheck2] = useState(false);
    const [finalCheck3, setFinalCheck3] = useState(false);
    const [finalCheck4, setFinalCheck4] = useState(false);

    // Helpers
    const nextStep = () => setStep(step + 1);

    const isStep2Valid = identificacao.email.includes('@') && identificacao.produto;
    const isStep3Valid = motivosSelecionados.length > 0 && (!motivosSelecionados.includes('Outro') || outroMotivo.length >= 3);
    const isJustificativaValid = justificativa.length >= 250;
    const isFinalValid = finalCheck1 && finalCheck2 && finalCheck3 && finalCheck4;

    const toggleMotivo = (motivo: string) => {
        setMotivosSelecionados(prev => prev.includes(motivo) ? prev.filter(m => m !== motivo) : [...prev, motivo]);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        alert("Para fins de auditoria, a justificativa deve ser digitada manualmente.");
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

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

            setStep(7); // Sucesso
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    // Estilos compartilhados (Identidade Lumen enviada via HTML)
    const styles = {
        label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' },
        input: { width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #ccc', borderRadius: '0', boxSizing: 'border-box' as const, marginBottom: '20px', fontSize: '14px', fontFamily: 'inherit', color: '#1a1a1a', outline: 'none' },
        button: { width: '100%', padding: '15px', backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '20px' },
        buttonDisabled: { width: '100%', padding: '15px', backgroundColor: '#e0e0e0', color: '#888888', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'not-allowed', fontSize: '16px', marginTop: '20px' },
        radioLabel: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '15px', cursor: 'pointer', fontSize: '14px' },
        h2: { fontSize: '20px', marginBottom: '10px', marginTop: 0 },
        p: { marginBottom: '20px', fontSize: '14px' },
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh", padding: "40px 20px", color: "#1a1a1a", display: "flex", justifyContent: "center", alignItems: "flex-start", boxSizing: "border-box" }}>
            <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>

                {/* Header idêntico ao HTML enviado */}
                <div style={{ backgroundColor: "#000000", color: "#ffffff", padding: "30px", textAlign: "center", letterSpacing: "2px" }}>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "normal" }}>LUMEN</h1>
                </div>

                <div style={{ padding: "40px", textAlign: "left" }}>

                    {/* --- ETAPA 1: TERMO DE CIÊNCIA --- */}
                    {step === 1 && (
                        <div>
                            <h2 style={styles.h2}>Solicitação de Desligamento de Ecossistema</h2>
                            <p style={styles.p}>
                                A Lumen investe pesado em tecnologia e suporte para quem deseja escalar resultados. Ao prosseguir com o pedido de reembolso, você está ciente de que esta ação é considerada uma quebra de confiança com o ecossistema. Isso resultará na suspensão imediata e permanente do seu CPF/E-mail para futuras compras, atualizações ou novos lançamentos da Lumen (Bora, Foquinha, LOTER.IA e projetos futuros).
                            </p>

                            <label style={styles.radioLabel}>
                                <input
                                    type="checkbox"
                                    checked={termoCiencia}
                                    onChange={(e) => setTermoCiencia(e.target.checked)}
                                    style={{ marginTop: '3px' }}
                                />
                                <span>
                                    Compreendo o risco de banimento permanente e desejo prosseguir com a auditoria manual.
                                </span>
                            </label>

                            <button
                                disabled={!termoCiencia}
                                onClick={nextStep}
                                style={termoCiencia ? styles.button : styles.buttonDisabled}
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 2: IDENTIFICAÇÃO --- */}
                    {step === 2 && (
                        <div>
                            <h2 style={styles.h2}>Identificação do Pedido</h2>
                            <p style={styles.p}>Por favor, confirme os dados da sua compra.</p>

                            <label style={styles.label}>E-mail utilizado na compra</label>
                            <input
                                type="email"
                                value={identificacao.email}
                                onChange={(e) => setIdentificacao({ ...identificacao, email: e.target.value })}
                                style={styles.input}
                            />

                            <label style={styles.label}>Produto que deseja cancelar:</label>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input type="radio" checked={identificacao.produto === 'Bora'} onChange={() => setIdentificacao({ ...identificacao, produto: 'Bora' })} /> Bora
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '14px' }}>
                                    <input type="radio" checked={identificacao.produto === 'Foquinha'} onChange={() => setIdentificacao({ ...identificacao, produto: 'Foquinha' })} /> Foquinha
                                </label>
                            </div>

                            <button
                                disabled={!isStep2Valid}
                                onClick={nextStep}
                                style={isStep2Valid ? styles.button : styles.buttonDisabled}
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 3: MAPEAMENTO DE FRUSTRAÇÃO --- */}
                    {step === 3 && (
                        <div>
                            <h2 style={styles.h2}>Motivo do Cancelamento</h2>

                            <label style={{ ...styles.label, fontWeight: 'normal', color: '#444' }}>Você pode selecionar mais de uma opção para nos ajudar a entender exatamente o que houve.</label>

                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    "Achei o processo muito complexo / Não consegui configurar.",
                                    "Não tenho tempo suficiente para aplicar o método.",
                                    "Achei que o resultado financeiro seria imediato.",
                                    "Bug Técnico / App travou.",
                                    "Imprevistos Financeiros e Pessoais.",
                                    "Outro"
                                ].map((motivo, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleMotivo(motivo)}
                                        style={{
                                            padding: '15px',
                                            border: motivosSelecionados.includes(motivo) ? '2px solid #000' : '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            backgroundColor: motivosSelecionados.includes(motivo) ? '#f4f4f4' : '#fff',
                                            transition: 'all 0.2s',
                                            fontWeight: motivosSelecionados.includes(motivo) ? 'bold' : 'normal'
                                        }}
                                    >
                                        {motivo}
                                    </div>
                                ))}
                            </div>

                            {motivosSelecionados.includes('Outro') && (
                                <div style={{ marginTop: '15px' }}>
                                    <label style={styles.label}>Poderia nos detalhar brevemente o motivo?</label>
                                    <input
                                        type="text"
                                        value={outroMotivo}
                                        onChange={(e) => setOutroMotivo(e.target.value)}
                                        placeholder="Ex: Minha conta do TikTok foi banida..."
                                        style={styles.input}
                                    />
                                </div>
                            )}

                            <button
                                disabled={!isStep3Valid}
                                onClick={nextStep}
                                style={isStep3Valid ? styles.button : styles.buttonDisabled}
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 4: ADAPTAÇÃO DO QUIZ --- */}
                    {step === 4 && (
                        <div>
                            <h2 style={styles.h2}>Antes de continuarmos, queremos te ouvir...</h2>
                            <p style={{ ...styles.label, fontWeight: 'normal', color: '#444', marginBottom: '20px' }}>
                                Percebemos que sua jornada não saiu como planejada. Para podermos te auxiliar ou concluir de vez sua rescisão, responda com sinceridade o principal ponto abaixo:
                            </p>

                            {motivosSelecionados.some(m => m.includes("complexo")) && (
                                <p style={styles.label}>Você chegou a tentar contato com nosso suporte técnico para que pudéssemos te ajudar na configuração inicial?</p>
                            )}

                            {motivosSelecionados.some(m => m.includes("tempo")) && (
                                <p style={styles.label}>O aplicativo pode ser executado em 15 minutos. Você diria que não conseguiu encaixar esse tempo na rotina, ou acabou priorizando outras tarefas por falta de direcionamento nosso?</p>
                            )}

                            {motivosSelecionados.some(m => m.includes("imediato")) && (
                                <p style={styles.label}>Na construção de um canal, consistência é tudo. Você conseguiu realizar as postagens de forma ininterrupta nos últimos 15 dias?</p>
                            )}

                            {motivosSelecionados.some(m => m.includes("Bug")) && (
                                <p style={styles.label}>Sentimos muito pela frustração! Em qual funcionalidade a ferramenta travou para você? Isso limitou completamente sua conta?</p>
                            )}

                            {(motivosSelecionados.some(m => m.includes("Financeiros")) || motivosSelecionados.includes("Outro")) && (
                                <p style={styles.label}>Entendemos perfeitamente o seu lado e sabemos que imprevistos fogem do nosso controle. Você precisou paralisar agora, mas cogita voltar a validar a estratégia no futuro?</p>
                            )}

                            <textarea
                                value={subResposta}
                                onChange={(e) => setSubResposta(e.target.value)}
                                style={{ ...styles.input, height: '100px', resize: 'vertical', marginTop: '10px' }}
                            ></textarea>

                            <button
                                disabled={subResposta.length < 5}
                                onClick={nextStep}
                                style={subResposta.length >= 5 ? styles.button : styles.buttonDisabled}
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 5: A GRANDE BARREIRA (400 CHARS) --- */}
                    {step === 5 && (
                        <div>
                            <h2 style={styles.h2}>Apenas para concluirmos</h2>

                            <label style={{ ...styles.label, fontWeight: 'normal', color: '#444' }}>
                                Valorizamos muito os comentários dos nossos usuários. Poderia nos explicar detalhadamente qual foi o principal obstáculo? Sua resposta é analisada diretamente pela equipe para entender de fato a sua dor atual.
                            </label>

                            <textarea
                                value={justificativa}
                                onChange={(e) => setJustificativa(e.target.value)}
                                onPaste={handlePaste}
                                placeholder="Conte-nos o que houve em mais detalhes..."
                                style={{ ...styles.input, height: '150px', resize: 'vertical' }}
                            ></textarea>

                            <div style={{ textAlign: 'right', fontSize: '12px', color: justificativa.length >= 250 ? '#2e7d32' : '#d32f2f', marginTop: '-15px', marginBottom: '15px', fontWeight: 'bold' }}>
                                Caracteres digitados: {justificativa.length} / 250
                            </div>

                            <button
                                disabled={!isJustificativaValid}
                                onClick={nextStep}
                                style={isJustificativaValid ? styles.button : styles.buttonDisabled}
                            >
                                Próximo
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 6: AVERSÃO À PERDA FINAL --- */}
                    {step === 6 && (
                        <div>
                            <h2 style={styles.h2}>Finalização da Solicitação</h2>
                            <p style={styles.p}>Sua solicitação será encaminhada para análise manual. Ao clicar em 'Finalizar Solicitação', você confirma que:</p>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={styles.radioLabel}>
                                    <input type="checkbox" checked={finalCheck1} onChange={(e) => setFinalCheck1(e.target.checked)} style={{ marginTop: '3px' }} />
                                    <span>Confirmo que todos os meus dados e históricos serão apagados permanentemente em 24h.</span>
                                </label>

                                <label style={styles.radioLabel}>
                                    <input type="checkbox" checked={finalCheck2} onChange={(e) => setFinalCheck2(e.target.checked)} style={{ marginTop: '3px' }} />
                                    <span>Entendo que o prazo de análise e resposta do time comercial é de 48 horas úteis.</span>
                                </label>

                                <label style={styles.radioLabel}>
                                    <input type="checkbox" checked={finalCheck3} onChange={(e) => setFinalCheck3(e.target.checked)} style={{ marginTop: '3px' }} />
                                    <span>Reconheço que o estorno depende da operadora do cartão e pode levar até 2 faturas.</span>
                                </label>

                                <label style={styles.radioLabel}>
                                    <input type="checkbox" checked={finalCheck4} onChange={(e) => setFinalCheck4(e.target.checked)} style={{ marginTop: '3px' }} />
                                    <span>Declaro que li e aceito a suspensão do meu acesso a futuros produtos da Lumen.</span>
                                </label>
                            </div>

                            <button
                                disabled={!isFinalValid || isSubmitting}
                                onClick={submitAuditoria}
                                style={(isFinalValid && !isSubmitting) ? styles.button : styles.buttonDisabled}
                            >
                                {isSubmitting ? 'Enviando ao Conselho...' : 'Finalizar Solicitação'}
                            </button>
                        </div>
                    )}

                    {/* --- ETAPA 7: SUCESSO --- */}
                    {step === 7 && (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ display: 'inline-block', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>
                                Solicitação Recebida
                            </div>

                            <h2 style={{ fontSize: '20px', marginBottom: '15px', marginTop: 0 }}>Pedido em Análise</h2>

                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
                                Sua solicitação de estorno foi recebida com sucesso pela nossa equipe de qualidade.
                            </p>

                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
                                Faremos a validação manual das suas respostas e você receberá um retorno da nossa equipe neste mesmo e-mail no prazo máximo de <strong>48 horas úteis</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer idêntico ao HTML enviado */}
                <div style={{ backgroundColor: "#f4f4f4", padding: "20px", textAlign: "center", fontSize: "12px", color: "#888888" }}>
                    <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Lumen. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
}
