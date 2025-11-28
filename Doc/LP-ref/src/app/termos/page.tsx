import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos e Condições de Uso – Foquinha AI",
  description:
    "Leia os termos e condições de uso da Foquinha AI, incluindo informações sobre planos, pagamentos, política de cancelamento e tratamento de dados.",
}

export default function TermsPage() {
  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-6 text-left text-slate-800">
        <div className="space-y-8 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Termos e Condições de Uso – Foquinha AI
            </h1>
            <p className="text-sm text-muted-foreground">Última atualização: 16 de setembro de 2025</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Identificação da Empresa</h2>
            <ul className="space-y-1 text-sm sm:text-base">
              <li>
                <strong>Razão Social:</strong> 59.393.438 BRUNO GIORGIO KAHN FALCI
              </li>
              <li>
                <strong>CNPJ:</strong> 59.393.438/0001-20
              </li>
              <li>
                <strong>Endereço:</strong> [Rua Tanhacu, 226, Jardim Panorama, São Paulo, SP, 05679040]
              </li>
              <li>
                <strong>E-mail:</strong> [brunosauce2000@gmail.com]
              </li>
              <li>
                <strong>Telefone:</strong> [11997627772]
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bem-vindo ao Foquinha AI, assistente inteligente para desenvolvimento de hábitos via WhatsApp, criado por Bruno Falci. Estes Termos e Condições de Uso (&quot;Termos&quot;) regem o seu acesso e uso do serviço Foquinha AI, estabelecendo um contrato legal entre você (&quot;Usuário&quot; ou &quot;Você&quot;) e a empresa acima identificada (&quot;Empresa&quot;, &quot;Nós&quot;).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao adquirir e utilizar o Foquinha AI, você declara que leu, compreendeu e concorda integralmente com estes Termos. Caso não concorde com qualquer disposição aqui presente, você não deverá utilizar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">1. Objeto e Descrição do Serviço</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              1.1. O Foquinha AI é um assistente virtual baseado em inteligência artificial que opera via WhatsApp, destinado ao acompanhamento e desenvolvimento de hábitos pessoais em tempo real.
            </p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">1.2. O serviço oferece as seguintes funcionalidades:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Acompanhamento personalizado de hábitos via conversas no WhatsApp</li>
                <li>Orientações e conselhos baseados em inteligência artificial treinada</li>
                <li>Interação livre e natural através de conversas</li>
                <li>Funcionamento 24 horas por dia, 7 dias por semana</li>
                <li>Coleta e análise de dados de progresso pessoal</li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              1.3. <strong>Natureza do Serviço:</strong> O Foquinha AI é uma ferramenta de apoio ao desenvolvimento pessoal baseada em inteligência artificial. As orientações fornecidas são geradas automaticamente e não constituem aconselhamento médico, psicológico ou terapêutico profissional.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              1.4. <strong>Limitações da IA:</strong> Você reconhece que o serviço utiliza inteligência artificial que, embora treinada, pode apresentar limitações, imprecisões ou respostas inadequadas. O serviço não substitui orientação profissional especializada.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              1.5. <strong>Resultados:</strong> Os benefícios do uso do serviço dependem exclusivamente da sua dedicação, constância e aplicação das orientações. Não garantimos resultados específicos relacionados à formação de hábitos, saúde ou bem-estar.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">2. Planos e Pagamento</h2>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">2.1. Planos Disponíveis:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Plano Anual: R$ 87,00 (oitenta e sete reais) por 12 meses</li>
                <li>Plano Mensal: 12x de R$ 9,00 (nove reais)</li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              2.2. <strong>Processamento de Pagamento:</strong> Os pagamentos são processados através da plataforma Kiwify, que possui suas próprias políticas de segurança e privacidade.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              2.3. <strong>Ativação Automática:</strong> Após a confirmação do pagamento via Kiwify, seu acesso ao Foquinha AI será liberado automaticamente.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              2.4. <strong>Renovação:</strong> Para planos mensais, a cobrança será automática conforme o parcelamento escolhido. Para planos anuais, você será notificado antes do vencimento sobre a renovação.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">3. Cancelamento e Reembolso</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              3.1. <strong>Direito de Arrependimento:</strong> Conforme o Art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/90), você poderá exercer o seu direito de arrependimento e solicitar o cancelamento no prazo de <strong>7 (sete) dias corridos</strong>, a contar da data da confirmação do pagamento. Neste caso, o reembolso será integral e incondicional.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              3.2. <strong>Solicitação de Cancelamento:</strong> A solicitação de cancelamento dentro do prazo de 7 dias deve ser feita através do e-mail de suporte: [INSERIR EMAIL DE SUPORTE].
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              3.3. <strong>Cancelamento Após 7 Dias:</strong> Após o prazo de 7 dias, não haverá reembolso. Para planos mensais, você pode cancelar a qualquer momento, mas continuará tendo acesso até o final do período já pago.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              3.4. <strong>Suspensão por Violação:</strong> Reservamo-nos o direito de suspender ou cancelar o acesso ao serviço, sem direito a reembolso, em caso de violação destes Termos ou uso inadequado do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">4. Uso do WhatsApp e Integrações</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              4.1. <strong>Plataforma Terceira:</strong> O Foquinha AI opera através do WhatsApp, que é uma plataforma de propriedade da Meta. Você deve possuir uma conta ativa no WhatsApp e concordar com os termos de uso da plataforma.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              4.2. <strong>Número de Telefone:</strong> É necessário fornecer um número de telefone válido e ativo no WhatsApp para utilizar o serviço.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              4.3. <strong>Limitações Técnicas:</strong> O funcionamento do serviço pode ser afetado por instabilidades do WhatsApp, da internet ou de outras plataformas integradas, sobre as quais não temos controle.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              4.4. <strong>Sem Limites de Mensagens:</strong> Não há limitação no número de mensagens que você pode enviar ao Foquinha AI.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">5. Inteligência Artificial e Processamento</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              5.1. <strong>Tecnologia OpenAI:</strong> O serviço utiliza tecnologia de inteligência artificial da OpenAI para gerar respostas e orientações personalizadas.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              5.2. <strong>Treinamento Específico:</strong> A IA foi treinada especificamente para questões relacionadas ao desenvolvimento de hábitos, mas pode não ter conhecimento sobre temas muito específicos ou atuais.
            </p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">5.3. Limitações e Responsabilidades:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>As respostas são geradas automaticamente e podem conter imprecisões</li>
                <li>A IA não possui capacidade de julgamento humano ou experiência prática</li>
                <li>Não nos responsabilizamos por decisões tomadas com base nas orientações da IA</li>
                <li>Em caso de dúvidas sobre saúde, sempre consulte profissionais qualificados</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">6. Coleta e Proteção de Dados (LGPD)</h2>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">6.1. Dados Coletados:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Número de telefone do WhatsApp</li>
                <li>Mensagens enviadas ao Foquinha AI</li>
                <li>Informações sobre hábitos compartilhadas voluntariamente</li>
                <li>Dados de progresso e interações com o serviço</li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              6.2. <strong>Base Legal:</strong> O tratamento dos seus dados é realizado com base no seu consentimento e na execução do contrato, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/18).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              6.3. <strong>Armazenamento:</strong> Seus dados são armazenados de forma segura no Supabase, plataforma que atende aos padrões internacionais de segurança de dados.
            </p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">6.4. Compartilhamento com Terceiros:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>OpenAI (para processamento de IA)</li>
                <li>WhatsApp/Meta (para entrega de mensagens)</li>
                <li>Supabase (para armazenamento seguro)</li>
                <li>N8N (para automação e integração)</li>
              </ul>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">6.5. Finalidades do Tratamento:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Fornecer orientações personalizadas sobre hábitos</li>
                <li>Manter histórico de conversas para continuidade do acompanhamento</li>
                <li>Melhorar a qualidade das respostas da IA</li>
                <li>Gerar relatórios de progresso pessoal</li>
              </ul>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">6.6. Seus Direitos:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Confirmar a existência de tratamento dos seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a eliminação de dados desnecessários</li>
                <li>Revogar seu consentimento a qualquer momento</li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              6.7. <strong>Retenção de Dados:</strong> Manteremos seus dados pelo período necessário para prestação do serviço e cumprimento de obrigações legais. Após o cancelamento, os dados serão mantidos por até 5 anos para fins de auditoria e cumprimento legal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">7. Propriedade Intelectual</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              7.1. Todos os elementos do Foquinha AI, incluindo algoritmos, prompts de IA, interfaces e metodologias, são de propriedade exclusiva da Empresa e protegidos pela legislação de direitos autorais.
            </p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">7.2. É proibido:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Reproduzir, copiar ou distribuir conversas ou orientações do Foquinha AI</li>
                <li>Tentar replicar ou fazer engenharia reversa do serviço</li>
                <li>Usar o conteúdo para criar serviços concorrentes</li>
                <li>Compartilhar acesso com terceiros</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">8. Conduta do Usuário</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              8.1. <strong>Uso Adequado:</strong> Você se compromete a usar o Foquinha AI de forma ética e responsável, apenas para os fins destinados.
            </p>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold">8.2. Proibições:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Enviar conteúdo ofensivo, discriminatório ou ilegal</li>
                <li>Tentar quebrar ou prejudicar o funcionamento do serviço</li>
                <li>Usar o serviço para fins comerciais não autorizados</li>
                <li>Compartilhar informações falsas ou enganosas</li>
              </ul>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              8.3. <strong>Consequências:</strong> O descumprimento das regras de conduta pode resultar na suspensão imediata do acesso sem direito a reembolso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">9. Limitação de Responsabilidade</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              9.1. <strong>Disponibilidade:</strong> Embora o serviço opere 24/7, não garantimos disponibilidade ininterrupta devido a manutenções, atualizações ou problemas técnicos de terceiros.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              9.2. <strong>Qualidade das Respostas:</strong> Não nos responsabilizamos pela precisão, adequação ou consequências das orientações fornecidas pela IA.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              9.3. <strong>Decisões Pessoais:</strong> Você é inteiramente responsável pelas decisões tomadas com base nas orientações do Foquinha AI.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              9.4. <strong>Problemas Técnicos:</strong> Não nos responsabilizamos por problemas relacionados ao WhatsApp, conexão de internet ou dispositivos do usuário.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">10. Atualizações e Modificações</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              10.1. <strong>Melhorias do Serviço:</strong> Podemos implementar melhorias, atualizações e novas funcionalidades sem custo adicional.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              10.2. <strong>Alterações nos Termos:</strong> Estes Termos podem ser atualizados periodicamente. Mudanças significativas serão comunicadas via WhatsApp ou e-mail.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              10.3. <strong>Descontinuação:</strong> Reservamo-nos o direito de descontinuar o serviço mediante aviso prévio de 30 dias, garantindo acesso aos seus dados para exportação.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">11. Disposições Gerais</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              11.1. <strong>Idade Mínima:</strong> O uso do Foquinha AI é destinado a pessoas maiores de 18 anos.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              11.2. <strong>Suporte:</strong> Oferecemos suporte através do e-mail [INSERIR EMAIL DE SUPORTE] com tempo de resposta de até 48 horas úteis.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              11.3. <strong>Foro:</strong> Para resolução de controvérsias, fica eleito o foro da Comarca de [INSERIR CIDADE/ESTADO], com renúncia a qualquer outro.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              11.4. <strong>Validade:</strong> Se qualquer cláusula for considerada inválida, as demais permanecerão em vigor.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              11.5. <strong>Acordo Integral:</strong> Estes Termos constituem o acordo integral entre as partes, substituindo qualquer acordo anterior.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao adquirir e utilizar o Foquinha AI, você declara ter lido, compreendido e concordado com todos os termos e condições aqui estabelecidos.
            </p>
          </section>

          <hr className="border-slate-200" />

          <section className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-slate-900">Para suporte e dúvidas:</p>
            <p>E-mail: [INSERIR EMAIL DE SUPORTE]</p>
            <p>WhatsApp: [INSERIR NÚMERO DE SUPORTE SE HOUVER]</p>
          </section>
        </div>
      </div>
    </div>
  )
}
