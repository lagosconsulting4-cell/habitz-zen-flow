# Fluxo completo da landing BORA

## Visão geral do funil
- **/ (Hero)** → Introduz o app BORA com a promessa “Pare de prometer. Comece a fazer.”, apresenta destaque visual (HeroCircle), mini-lista de benefícios e CTA “Descobrir agora”.
- **/quiz** → Questionário diagnóstico com 10 perguntas, indicadores de progresso, interações via swipe e feedback em tempo real.
- **/mirror** → Espelho narrativo do dia da pessoa (manhã → noite), reforça sensação de urgência, mostra emoção predominante e libera CTA para a oferta.
- **/offer** → Página longa com prova social, cronograma sugerido, antes/depois, diferenciais, depoimentos, FAQ e oferta principal (R$ 47). Inclui contadores regressivos e múltiplos CTAs.
- **/obrigado** → Confirma pagamento, coleta senha de acesso, dá atalhos alternativos (Kirvano, reenvio por e-mail) e canais de suporte.

## 1. Página inicial / (Hero)
- **Badge**: “App BORA”.
- **Headline**: “Pare de prometer. Comece a fazer.” com destaque em gradiente.
- **Subheadline**: “Descubra em 2 minutos por que você não consegue manter uma rotina — e como mudar isso de verdade.”
- **Mini-lista de benefícios**: “Rotina personalizada”, “Resultados rápidos”, “Método comprovado”.
- **CTA principal**: botão premium “Descobrir agora” → `/quiz` + microcopy “Grátis • 2 minutos • Sem cadastro”.
- **Prova social**: pilha de avatares e texto “+5.000 pessoas já viraram o jogo”.
- **Decor**: fundo com gradiente radial + círculos animados (HeroCircle).

## 2. Quiz diagnóstico (/quiz)
### Estrutura geral
- Header mostra título da pergunta, ícone e progresso (barra + contador “Pergunta X/10”).
- Opções usam cartões com realce, ícones de seleção e animações hover/tap; swipe horizontal avança ou retrocede.
- Há feedback intermediário (SiriOrb) e, ao final, uma tela de celebração com confetes, score e CTA “Ver minha solução personalizada”.

### Perguntas (texto original + alternativas)
1. **“Quão difícil é criar uma rotina que realmente funciona?”**
   - “Impossível — sempre desisto.”
   - “Começo empolgado, mas perco o ritmo em dias.”
   - “Às vezes consigo manter, mas não é consistente.”
   - “Consigo seguir com disciplina.”
2. **“O que você sente ao ver alguém evoluindo enquanto você está parado?”**
   - “Frustração profunda — sinto que fiquei pra trás.”
   - “Inveja disfarçada de motivação.”
   - “Indiferença — cada um no seu tempo.”
   - “Inspiração real — quero fazer igual.”
3. **“Quantas vezes você prometeu a si mesmo que ia mudar... e não mudou?”**
   - “Perdi a conta — virou piada interna.”
   - “Umas 5 a 10 vezes só esse ano.”
   - “Algumas vezes, mas tento não pensar nisso.”
   - “Raramente prometo, prefiro agir.”
4. **“Qual dessas frases mais dói quando você pensa nela?”**
   - “Estou estagnado e cansado de mim mesmo.”
   - “Sinto que o tempo tá passando e eu não saí do lugar.”
   - “Não sei nem por onde começar.”
   - “Estou fazendo meu melhor e crescendo.”
5. **“O que realmente te impede de viver como você quer?”**
   - “Falta de disciplina — sempre deixo pra depois.”
   - “Paralisia — não sei por onde começar.”
   - “Falta de tempo — minha rotina é caótica.”
   - “Nada — estou construindo meu caminho.”
6. **“Quando você cria uma meta, o que geralmente acontece?”**
   - “Desisto em 2 semanas ou menos.”
   - “Começo bem, mas perco a energia rápido.”
   - “Mantenho algumas metas, outras caem no esquecimento.”
   - “Geralmente atinjo o que estabeleço.”
7. **“Qual pensamento mais aparece na sua mente ultimamente?”**
   - “Segunda eu começo... (mas nunca começa).”
   - “Mais um dia que eu desperdicei.”
   - “Por que diabos eu não consigo mudar?”
   - “Estou evoluindo, um passo de cada vez.”
8. **“Como anda sua energia durante o dia?”**
   - “Sempre exausto, vivo no piloto automático.”
   - “Minha energia despenca do nada — muito instável.”
   - “Razoável, mas podia ser bem melhor.”
   - “Acordo disposto e mantenho o ritmo.”
9. **“Olhando pro último ano, você sente que evoluiu de verdade?”**
   - “Não. Estou no mesmo lugar (ou pior).”
   - “Quase nada — mudou pouca coisa.”
   - “Evoluí um pouco, mas muito devagar.”
   - “Sim, vejo progresso real.”
10. **“Se você continuar exatamente como está hoje, onde vai estar daqui a 1 ano?”**
    - “No mesmo lugar — mais velho, mais arrependido.”
    - “Provavelmente igual... ou até pior.”
    - “Talvez diferente, mas não tenho certeza.”
    - “Em outro nível — estou construindo meu futuro agora.”

### Resultado do quiz
- **Título**: “Seu diagnóstico está pronto”. Exibe nível (Leve, Moderado ou Urgente) com emoji e cor específica.
- **Descrição** (por severidade):
  - *Leve*: “Você já tem bons hábitos! Com um pouco mais de organização, pode alcançar resultados extraordinários.”
  - *Moderado*: “Você tem potencial, mas precisa de um sistema para criar consistência. O BORA foi feito para você!”
  - *Severo/Urgente*: “Sua rotina precisa de uma transformação. O BORA pode te ajudar em apenas 7 minutos por dia.”
- **Score bar** mostra “Seu score X/Y (percentual %)”.
- **CTA**: botão premium “Ver minha solução personalizada” → `/mirror`.

## 3. Página espelho (/mirror)
### Dinâmica
- Fundo em gradiente muda conforme bloco do dia selecionado (manhã → noite).
- Header alterna mensagem personalizada de acordo com a severidade do quiz:
  - Urgente: “Seu diagnóstico mostrou que sua rotina precisa de atenção urgente. Mas não se preocupe — temos a solução.”
  - Moderado: “Você tem potencial, mas está deixando ele escapar. Vamos mudar isso juntos.”
  - Leve: “Você está no caminho certo! Com pequenos ajustes, pode alcançar resultados extraordinários.”
- Indicador de progresso pede: “Toque em cada momento do dia para ver seu reflexo” / “Explore todos os momentos do dia para continuar”.

### Blocos do dia e cópias
1. **07:00 — “Mais um dia igual” (Manhã, emoção Culpa)**
   - Descrição: “Acordou cansado. Pegou o celular antes de levantar. 40 minutos já se passaram e você nem saiu da cama.”
   - Detalhes: “Scrollou redes sociais por 40 minutos”, “Pulou o café da manhã de novo”, “Começou o dia já atrasado”.
2. **12:30 — “Almoço e procrastinação” (Meio-dia, emoção Frustração)**
   - Descrição: “Prometeu começar depois do almoço. Está rolando o feed há 30 minutos enquanto a tarde escapa.”
   - Detalhes: “Deixou tarefas importantes para depois”, “Não conseguiu focar em nada produtivo”, “A lista de pendências só aumenta”.
3. **18:00 — “Final do dia” (Fim de tarde, emoção Decepção profunda)**
   - Descrição: “Olha pra trás e percebe: mais um dia perdido sem fazer o que realmente importa. De novo.”
   - Detalhes: “Nenhuma meta foi concluída”, “Sensação de tempo desperdiçado”, “Promessas não cumpridas”.
4. **23:00 — “Antes de dormir” (Noite, emoção Sensação de estar ficando pra trás)**
   - Descrição: “'Amanhã vai ser diferente', você pensa. Mas lá no fundo, sabe que não será. Nunca foi.”
   - Detalhes: “Mente acelerada com arrependimentos”, “Ansiedade sobre o amanhã”, “O ciclo se repete há meses”.

### Destaque emocional
- Cada bloco mostra card “Sensação do momento”, com badge, ícone e copy “Como você se sente agora?” + emoção correspondente.

### CTA final
- Cartão gradiente com copy “E se pudesse ser diferente? Criamos uma rotina sob medida para você”, highlights “7 min/dia” e “100% personalizada”.
- Botão branco “Ver minha rotina personalizada” → `/offer`.

## 4. Página de oferta (/offer)
### Hero
- Badge: “Sua rotina personalizada está pronta”.
- Headline: “Em menos de 7 minutos por dia, você vira o jogo.”
- Sub-copy: “Baseado nas suas respostas, criamos um plano único para você sair da estagnação e criar consistência real.”
- Stats: “7 minutos/dia”, “+5.000 vidas transformadas”, “94% mantêm a rotina”.
- CountdownTimer + botão “QUERO MINHA ROTINA” (scroll para pricing).

### Linha do tempo “Um dia na sua melhor versão”
- 07:00 Manhã — “Despertar com propósito”.
- 12:00 Meio-dia — “Check-in de progresso”.
- 18:00 Tarde — “Revisão de metas”.
- 22:00 Noite — “Reflexão e gratidão”.
- Microcopy: “Cada momento leva menos de 2 minutos”.

### Antes x Depois (tabs)
- **Sem BORA**: “Acordar sem energia ou motivação”, “Procrastinar tarefas importantes”, “Mente sobrecarregada e ansiosa”, “Dormir com sensação de fracasso”.
- **Com BORA**: “Despertar com clareza e energia”, “Foco nas prioridades certas”, “Consistência sem esforço”, “Orgulho real das suas conquistas”.

### Recursos do app (bento grid)
- “Rotina Sob Medida — Criada especificamente para seus objetivos e estilo de vida. Nada genérico.”
- “Checklists Diários — Simples e práticos.”
- “Progresso Visual — Veja sua evolução.”
- “Lembretes Inteligentes — No momento certo, sem ser invasivo.”
- “Transformação Real — Sem teoria, só execução prática.”

### Depoimentos (carrossel)
- **Lucas Mendes (28, designer)**: “Em 14 dias, passei de acordar às 10h para às 6h30 naturalmente. Minha produtividade aumentou 40% e finalmente entrego projetos no prazo.”
- **Mariana Costa (24, estudante)**: “Completei 21 dias de streak consecutivos! Antes não conseguia manter nada por mais de 3 dias. Passei em 2 concursos estudando só 2h/dia com foco.”
- **Rafael Silva (32, empreendedor)**: “Em 30 dias, perdi 4kg e dobrei o faturamento da empresa. O segredo foi ter clareza do que fazer a cada momento do dia.”
- **Ana Paula (29, médica)**: “Mesmo com plantões de 24h, mantenho 87% de consistência nos meus hábitos. O BORA se adapta quando minha rotina muda.”

### Seções adicionais
- **Progresso visual + métricas animadas** (AnimatedCounter) ao longo da página.
- **Tabs/Accordion** com garantias e diferenciais (ex.: “Transformação garantida”, “Recursos exclusivos”).

### Preço e oferta
- Preço ancorado R$ 97 → oferta R$ 47 (pagamento único, acesso vitalício).
- Lista “O que está incluso”:
  1. Acesso vitalício ao app BORA.
  2. Rotina 100% personalizada.
  3. Checklists diários inteligentes.
  4. Acompanhamento de progresso.
  5. Lembretes personalizados.
  6. Suporte prioritário.
  7. Atualizações gratuitas.
- CountdownTimer dentro do card de preço + badge “Oferta Especial de Lançamento”.
- CTA: botão gradiente com link `https://pay.kirvano.com/5dc4f0b1-fc02-490a-863d-dd1c680f1cac` e texto “QUERO MINHA ROTINA”.

### FAQ (5 itens)
1. **“Quanto tempo preciso dedicar por dia?”** — “Apenas 7 minutos! Nosso método foi desenhado para se encaixar na rotina mais corrida. São micro-hábitos que geram macro resultados.”
2. **“Funciona mesmo se eu já tentei de tudo?”** — “Sim! O BORA é diferente porque não tenta mudar tudo de uma vez. Começamos com pequenas vitórias que criam momentum para mudanças maiores.”
3. **“E se eu não gostar?”** — “Garantia de 7 dias. Se não sentir diferença, devolvemos 100% do investimento.”
4. **“Preciso baixar algum app?”** — “Não. Funciona direto no navegador do celular. Dá para salvar na tela inicial e usar offline. Acesso imediato após a compra.”
5. **“Como funciona a personalização?”** — “Usamos suas respostas do quiz para montar uma rotina única. O sistema aprende com seu uso e se adapta.”

### CTA final
- Bloco escuro com título “Sua nova rotina está pronta para começar agora.”
- Subcopy: “Junte-se a mais de 5.000 pessoas que já transformaram suas vidas com apenas 7 minutos por dia.”
- Botão branco “QUERO MINHA ROTINA” + selo “Garantia 7 dias / Acesso imediato / Resultados 7 dias”.

## 5. Página Obrigado (/obrigado)
- **Feedback inicial**: confete + badge “Pagamento confirmado!”.
- **Título**: “Crie sua senha e entre agora mesmo”.
- **Descrição**: “Em menos de dois minutos você já consegue acessar o app... Esse processo vale para compras feitas pela Kirvano.”
- **Formulário**: campos “E-mail da compra” e “Crie sua senha (mínimo 6 caracteres)”, botão “Liberar acesso” com estado “Validando dados...”. Microcopy: “Ao criar a senha você concorda com os Termos de Uso e Política de Privacidade do BORA.”
- **Feedbacks**: mensagens para “Preencha todos os campos.”, “Digite um e-mail válido.”, “A senha deve ter pelo menos 6 caracteres.”, “Verificando pagamento...”, “Acesso liberado! Redirecionando para o app...”, erros de API.
- **Ações alternativas**:
  - Link “Área de Membros Kirvano” (`https://app.kirvano.com/`).
  - Botão “Reenviar link por e-mail”.
- **Cartões de informação**:
  - “Não achou o e-mail?” — procurar por “BORA” ou “scalewithlumen”, adicionar `scalewithlumen@gmail.com`, aguardar confirmação de boleto/PIX.
  - “O que já está liberado” — criação ilimitada de hábitos, dashboard com streaks, calendário diário, lembretes inteligentes e meditações guiadas.
- **Suporte**: card com CTA “Falar no WhatsApp” (`https://api.whatsapp.com/send?phone=5511993371766...`) e instrução “ou escreva para scalewithlumen@gmail.com”.
- **Rodapé**: “© {ano atual} BORA. Todos os direitos reservados.”

---
**Observações finais**
- O fluxo inteiro reutiliza o contador regressivo (`CountdownTimer`) no hero e no pricing para reforçar urgência.
- Resultados do quiz são salvos em `sessionStorage` e reutilizados no `/mirror` para personalizar mensagens e liberar o CTA final.
- Todos os CTAs principais apontam para `/quiz`, `/mirror`, `/offer`, checkout (Kirvano) ou área logada, garantindo continuidade do usuário até a ativação.
