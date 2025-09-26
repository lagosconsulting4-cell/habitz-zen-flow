﻿import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const supportEmail = "lagosconsulting4@gmail.com";

const Terms = () => (
  <div className="min-h-screen bg-background py-16">
    <div className="mx-auto w-full max-w-4xl px-6">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" className="gap-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Última atualização: 16 de setembro de 2025</span>
      </div>

      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Termos e Condições de Uso – Habitz
        </h1>
        <p className="text-muted-foreground">
          Ao utilizar o Habitz, você concorda com os termos descritos abaixo. Leia com atenção antes de continuar utilizando a plataforma.
        </p>
      </div>

      <Card className="mt-10 divide-y divide-border">
        <section className="space-y-6 p-8">
          <div>
            <h2 className="text-xl font-semibold">1. Identificação da Empresa</h2>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p><strong>Razão Social:</strong> BRUNO GIORGIO KAHN FALCI</p>
              <p><strong>CNPJ:</strong> 59.393.438/0001-20</p>
              <p><strong>Endereço:</strong> Rua Tanhaçu, 336 – Jardim Panorama, São Paulo/SP – 05679-040</p>
              <p><strong>E-mail de contato:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Objeto e descrição do serviço</h2>
            <p>O Habitz é um aplicativo web que apoia o desenvolvimento de hábitos saudáveis, a prática de meditação e o acompanhamento de rotinas pessoais de bem-estar.</p>
            <p className="font-medium">Principais funcionalidades:</p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Sistema de acompanhamento de hábitos pessoais</li>
              <li>Meditações guiadas em áudio</li>
              <li>Programas com diferentes níveis de profundidade</li>
              <li>Funcionamento offline após o primeiro acesso</li>
              <li>Interface para criar e monitorar rotinas</li>
            </ul>
            <p>O Habitz é uma ferramenta de apoio ao desenvolvimento pessoal e não substitui aconselhamento médico, psicológico ou terapêutico. Os resultados dependem exclusivamente da dedicação e consistência de cada usuário.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">3. Licença de uso e acesso</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>O acesso vitalício custa R$ 47,90 (pagamento único).</li>
              <li>Aceitamos pagamentos via PIX, boleto bancário e cartão de crédito.</li>
              <li>A licença é pessoal, intransferível e não exclusiva. Compartilhar credenciais com terceiros não é permitido.</li>
              <li>Após a confirmação do pagamento, o usuário mantém acesso permanente ao aplicativo e às atualizações futuras.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">4. Cancelamento e reembolso</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>O usuário pode exercer o direito de arrependimento em até 7 dias corridos após a compra, conforme o artigo 49 do CDC. O reembolso é integral.</li>
              <li>Solicitações devem ser encaminhadas por escrito para <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a>.</li>
              <li>Após o prazo de 7 dias, não há reembolso, pois todo o conteúdo já está liberado.</li>
              <li>Reservamo-nos o direito de suspender ou cancelar o acesso em caso de violação destes Termos, sem reembolso.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">5. Propriedade intelectual</h2>
            <p>Todos os conteúdos do Habitz — áudios, textos, design, códigos e algoritmos — são de propriedade exclusiva da empresa e protegidos pela legislação brasileira.</p>
            <p className="font-medium">É proibido:</p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Copiar, distribuir ou compartilhar qualquer conteúdo do aplicativo;</li>
              <li>Executar engenharia reversa das funcionalidades;</li>
              <li>Criar obras derivadas;</li>
              <li>Usar conteúdos para fins comerciais sem autorização expressa.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">6. Coleta e proteção de dados (LGPD)</h2>
            <p>Tratamos os dados inseridos no Habitz com base no consentimento e no legítimo interesse, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18).</p>
            <p className="font-medium">Usamos seus dados para:</p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Operar o sistema de acompanhamento de hábitos;</li>
              <li>Personalizar a experiência de uso;</li>
              <li>Gerar relatórios de progresso;</li>
              <li>Melhorar funcionalidades do aplicativo.</li>
            </ul>
            <p>Reconhecemos que hábitos, rotina e bem-estar são dados sensíveis. Não compartilhamos essas informações com terceiros. Parte dos dados é armazenada localmente no dispositivo do usuário quando ele estiver offline.</p>
            <p className="font-medium">Seus direitos:</p>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar e corrigir informações pessoais;</li>
              <li>Solicitar a exclusão de dados desnecessários;</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">7. Responsabilidades e limitações</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>O usuário deve utilizar o aplicativo de forma responsável e de acordo com estes Termos.</li>
              <li>A empresa não se responsabiliza por decisões tomadas a partir das informações do Habitz, por resultados de saúde ou por problemas técnicos do dispositivo do usuário.</li>
              <li>Recomendamos consultar profissionais de saúde antes de iniciar programas intensos de hábitos, exercícios ou meditações.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">8. Atualizações e modificações</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>O Habitz pode receber melhorias e novas funcionalidades sem custo adicional para quem possui acesso vitalício.</li>
              <li>Os Termos podem ser atualizados. Notificaremos mudanças relevantes por e-mail ou dentro do aplicativo.</li>
              <li>Em caso de descontinuidade do serviço, informaremos com 90 dias de antecedência para que o usuário exporte seus dados.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">9. Disposições gerais</h2>
            <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
              <li>O Habitz é indicado para maiores de 18 anos. Menores devem ter autorização dos responsáveis.</li>
              <li>Suporte técnico: <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a> (resposta em até 48 horas úteis).</li>
              <li>Foro eleito: Comarca de São Paulo/SP.</li>
              <li>Se alguma cláusula for considerada inválida, as demais permanecerão válidas.</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Ao finalizar a compra ou continuar usando o Habitz, você declara que leu e concorda com todos os termos descritos neste documento.
          </p>
        </section>
      </Card>
    </div>
  </div>
);

export default Terms;
