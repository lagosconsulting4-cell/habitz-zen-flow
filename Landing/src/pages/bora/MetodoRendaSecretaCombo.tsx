import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, PlayCircle, ShieldCheck, Lock, CreditCard } from "lucide-react";

export default function MetodoRendaSecretaCombo() {

    // Configurando o Title e removendo bloqueios do Head default
    useEffect(() => {
        document.title = "Já pensou em ter o BORA de graça?";
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden pt-8">
            {/* Hero Section */}
            <section className="container mx-auto px-4 lg:px-6 flex flex-col items-center text-center space-y-6 max-w-4xl pt-6 pb-12">
                <span className="inline-block px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#CCFF00] text-xs sm:text-sm font-medium tracking-wide mb-2 uppercase">
                    🔴 Você foi selecionado para uma oferta de resgate
                </span>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                    JÁ PENSOU EM TER O <span className="text-[#CCFF00]">BORA DE GRAÇA?</span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-300 font-medium pb-4 max-w-3xl">
                    Nós sabemos que às vezes é difícil focar na saúde quando o financeiro aperta. Então decidimos inverter o jogo pra você.
                </p>

                {/* VSL Placeholder */}
                <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-[#CCFF00]/20 group cursor-pointer mb-6">
                    <img src="/images/lp/hero_mockup.webp" alt="Video Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <PlayCircle className="w-20 h-20 text-[#CCFF00] z-10 opacity-90 group-hover:scale-110 transition-transform" />
                    <p className="z-10 mt-4 text-sm font-medium text-zinc-300">Clique para iniciar a apresentação</p>
                </div>

                {/* Early CTA (Hidden initially in real VSL, but visible for preview) */}
                <div className="w-full max-w-md mx-auto pt-6">
                    <Button
                        className="w-full h-16 text-lg font-bold bg-[#CCFF00] hover:bg-[#b3e600] text-black rounded-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all uppercase tracking-wide"
                        onClick={() => document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        ⚡ DESCUBRA COMO FUNCIONA
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-zinc-500">
                        <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                        <span>Acompanhe a apresentação completa acima</span>
                    </div>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-8" />

            {/* Intro / Aquecimento Section (Combo Text) */}
            <section className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl text-center">
                <div className="flex justify-center mb-6">
                    <img src="https://img.icons8.com/ios-filled/150/CCFF00/gift--v1.png" alt="Presente do BORA" className="w-16 h-16 opacity-90 shadow-[0_0_30px_rgba(204,255,0,0.2)] rounded-full" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-4">A engrenagem silenciosa de Renda Extra.</h2>
                <p className="text-lg text-zinc-400">
                    Acabamos de liberar uma estrutura que permite gerar receita recorrente nos bastidores, dedicando apenas 15 minutos do seu dia, pelo TikTok.
                    <br /><br />
                    A novidade é: quem decidir operar essa máquina silenciosa hoje através do <strong className="text-white">Método Renda Secreta</strong>, <strong className="text-[#CCFF00]">leva o acesso total ao BORA totalmente de graça por 1 Ano.</strong>
                </p>
            </section>

            {/* Curriculum Section */}
            <section className="container mx-auto px-4 lg:px-6 py-12 max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold">COMO FUNCIONA O PASSO A PASSO:</h2>
                    <div className="w-20 h-1 bg-[#CCFF00] mx-auto mt-4 rounded-full" />
                </div>

                <div className="space-y-4">
                    {[
                        {
                            title: "Aula 1: O Ponto de Partida",
                            desc: "O que é o aplicativo, como ele funciona e como você ganha o seu Link de Recebimento."
                        },
                        {
                            title: "Aula 2: A Página Sem Rosto",
                            desc: "Como criar uma página nova nas redes sociais do zero, sem colocar o seu nome ou a sua foto."
                        },
                        {
                            title: "Aula 3: O Conteúdo que Funciona",
                            desc: "Como pegar o nosso estoque de fotos profissionais e organizar no formato de 'álbum' para prender a atenção das pessoas."
                        },
                        {
                            title: "Aula 4: Os Textos Automáticos",
                            desc: "Como usar os nossos comandos prontos de Inteligência Artificial para gerar o texto da postagem em 10 segundos, sem ter que inventar nada."
                        },
                        {
                            title: "Aula 5: A Rotina de 15 Minutos",
                            desc: "Como juntar tudo, agendar suas postagens para o dia inteiro e deixar a página trabalhando por você."
                        }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-xl backdrop-blur-sm">
                            <div className="flex-shrink-0 mt-1">
                                <CheckCircle2 className="w-6 h-6 text-[#CCFF00]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-zinc-100">{item.title}</h3>
                                <p className="text-zinc-400 mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bonuses Section */}
            <section className="container mx-auto px-4 lg:px-6 py-12 max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold">Os Arquivos Secretos <span className="text-[#CCFF00]">(O Seu Arsenal):</span></h2>
                    <p className="text-zinc-400 mt-2">Além do acesso gratuito ao App Bora, a sua inscrição hoje destrava nosso pacote de atalhos operacionais.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="relative bg-zinc-900 border border-[#CCFF00]/30 rounded-xl p-6 flex flex-col items-center text-center overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">BÔNUS 1</div>
                        <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mb-4 text-[#CCFF00]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">O Robô de Carrosséis</h3>
                        <p className="text-sm text-zinc-400">Você só copia e cola. Um robô já instruído escreve as frases exatas e hipnóticas para as postagens.</p>
                    </div>

                    <div className="relative bg-zinc-900 border border-[#CCFF00]/30 rounded-xl p-6 flex flex-col items-center text-center overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">BÔNUS 2</div>
                        <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mb-4 text-[#CCFF00]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Banco de Imagens Validadas</h3>
                        <p className="text-sm text-zinc-400">Acesso a uma pasta com centenas de fotos estéticas atualizadas. Nunca precise usar o canva, baixe e poste.</p>
                    </div>

                    <div className="relative bg-zinc-900 border border-[#CCFF00]/30 rounded-xl p-6 flex flex-col items-center text-center overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">BÔNUS 3</div>
                        <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mb-4 text-[#CCFF00]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Comunidade VIP VIP</h3>
                        <p className="text-sm text-zinc-400">Acesso liberado a um grupo focado onde os alunos aplicam a mesma estratégia juntos. Nunca mais ande sozinho.</p>
                    </div>

                    <div className="relative bg-zinc-900 border border-[#CCFF00]/30 rounded-xl p-6 flex flex-col items-center text-center overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#CCFF00] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">BÔNUS 4</div>
                        <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mb-4 text-[#CCFF00]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-2">Mentoria Mensal ao Vivo</h3>
                        <p className="text-sm text-zinc-400">Uma vez por mês, você terá um encontro ao vivo comigo para analisarmos seu perfil, corrigirmos a rota e escalarmos suas vendas.</p>
                    </div>
                </div>
            </section>

            {/* Value Stack & Pricing Offer Section */}
            <section id="offer" className="container mx-auto px-4 lg:px-6 py-16 max-w-3xl">

                {/* Ancoragem (Stack) - Oferta de Resgate Combo */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8">
                    <h3 className="text-xl md:text-2xl font-bold mb-6 text-center text-zinc-100">O que você destrava exatamente agora:</h3>
                    <ul className="space-y-4 mb-6 text-zinc-300">
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span>O Passo a Passo Renda Secreta</span>
                            <span className="text-zinc-500 line-through">R$ 297,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span className="text-[#CCFF00] font-bold">1 Ano de Acesso Premium ao BORA</span>
                            <span className="text-zinc-500 line-through">R$ 147,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span>O Robô de Carrosséis (IA)</span>
                            <span className="text-zinc-500 line-through">R$ 97,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span>O Banco de Imagens Validadas</span>
                            <span className="text-zinc-500 line-through">R$ 147,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span>Acesso à Comunidade de Networking</span>
                            <span className="text-zinc-500 line-through">R$ 97,00</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                            <span>Acesso à Mentoria Ao Vivo Mensal</span>
                            <span className="text-zinc-500 line-through">R$ 297,00</span>
                        </li>
                        <li className="flex justify-between items-center pt-2 font-bold text-xl md:text-2xl">
                            <span>Valor Total Real:</span>
                            <span className="text-red-400 line-through">R$ 1.082,00</span>
                        </li>
                    </ul>
                    <p className="text-center text-[#CCFF00] font-bold text-lg mt-4">Sua oferta única de resgate:</p>
                </div>

                <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-[#CCFF00]/30 p-1 shadow-[0_0_40px_rgba(204,255,0,0.15)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

                    <div className="p-8 md:p-10 flex flex-col items-center text-center">
                        <div className="my-2">
                            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Apenas 12x de</p>
                            <div className="flex items-start justify-center text-[#CCFF00]">
                                <span className="text-3xl font-bold mt-2 mr-1">R$</span>
                                <span className="text-7xl font-black tracking-tighter">19,70</span>
                            </div>
                            <p className="text-zinc-500 mt-2 text-sm">(ou R$ 197 à vista)</p>
                        </div>

                        <Button
                            className="w-full max-w-sm h-16 text-xl font-bold bg-[#CCFF00] hover:bg-[#b3e600] text-black mt-8 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all hover:scale-105 uppercase"
                            onClick={() => window.location.href = 'https://pay.hub.la/Z11Q6cGxgTlT1yvqHgej'}
                        >
                            ⚡ QUERO O BORA DE GRAÇA
                        </Button>

                        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap opacity-60">
                            <span className="flex items-center text-xs text-zinc-400"><Lock className="w-4 h-4 mr-1" /> Compra Segura</span>
                            <span className="flex items-center text-xs text-zinc-400"><CreditCard className="w-4 h-4 mr-1" /> Checkout Seguro</span>
                            <span className="flex items-center text-xs text-zinc-400"><ShieldCheck className="w-4 h-4 mr-1" /> 7 Dias de Garantia</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="container mx-auto px-4 lg:px-6 py-16 max-w-3xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold">Dúvidas Frequentes</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-zinc-800">
                        <AccordionTrigger className="text-left font-bold py-5">Eu preciso aparecer?</AccordionTrigger>
                        <AccordionContent className="text-zinc-400">
                            Não. Essa é a Operação Invisível. Ninguém saberá quem é o dono das páginas que você vai criar para o nosso aplicativo.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-zinc-800">
                        <AccordionTrigger className="text-left font-bold py-5">Eu preciso esperar todos os dias pelas aulas?</AccordionTrigger>
                        <AccordionContent className="text-zinc-400">
                            Não! Ensinamos em missões de 15 minutos passo a passo para você executar na hora e já começar seu movimento, sem enrolação.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border-zinc-800">
                        <AccordionTrigger className="text-left font-bold py-5">Como recebo o App BORA de graça?</AccordionTrigger>
                        <AccordionContent className="text-zinc-400">
                            Assim que o pagamento do Método Renda Secreta for aprovado, seu e-mail será liberado na nossa plataforma como Premium por 1 Ano, sem nenhuma cobrança adicional.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-zinc-800 border-b-0">
                        <AccordionTrigger className="text-left font-bold py-5">E se eu não gostar ou não conseguir fazer?</AccordionTrigger>
                        <AccordionContent className="text-zinc-400">
                            Você tem 7 dias cheios para testar imagens, ver nossa estratégia por dentro. Se por qualquer motivo não te servir ou achar difícil, a gente te devolve cada centavo na hora. O risco é nosso.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>

            {/* Footer */}
            <footer className="w-full bg-black py-8 border-t border-zinc-900 mt-10">
                <div className="container mx-auto px-4 text-center text-xs text-zinc-600">
                    <p>© {new Date().getFullYear()} Habitz & Bora App. Todos os direitos reservados.</p>
                    <div className="mt-2 space-x-4">
                        <a href="#" className="hover:text-zinc-400">Termos de Uso</a>
                        <a href="#" className="hover:text-zinc-400">Políticas de Privacidade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
