import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSWORD_ENDPOINT = "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/create-password-direct";
const APP_URL = "https://habitz.life/app";
const MEMBERS_AREA_URL = "https://app.kirvano.com/";

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
  }
}

const Obrigado = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    // Track Lead event on page load
    if (window.fbq) {
      window.fbq("track", "Lead");
    }
  }, []);

  const buildAppAuthUrl = () => {
    try {
      const url = new URL(APP_URL);
      url.pathname = "/app/auth";
      return url.toString();
    } catch {
      return `${APP_URL}/auth`;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFeedback({ message: "Preencha todos os campos.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setFeedback({ message: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: "Verificando pagamento no Supabase...", type: null });

    try {
      const response = await fetch(PASSWORD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível liberar o acesso.");
      }

      setFeedback({ message: "Acesso liberado! Redirecionando para o app...", type: "success" });

      // Track Subscribe event
      if (window.fbq) {
        window.fbq("track", "Subscribe", { value: 1, currency: "BRL" });
      }

      setTimeout(() => {
        window.location.href = buildAppAuthUrl();
      }, 1800);
    } catch (error) {
      console.error("[obrigado] create-password error", error);
      setFeedback({
        message: error instanceof Error ? error.message : "Erro ao liberar acesso. Tente novamente.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    if (!email.trim()) {
      setFeedback({ message: "Digite o e-mail da compra para receber novas instruções.", type: "error" });
      return;
    }
    setFeedback({
      message: "Enviamos instruções de recuperação para o seu e-mail. Caso não veja em 5 minutos, procure nas abas Promoções ou Spam.",
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <span className="text-2xl font-bold text-accent">Habitz</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Success Badge */}
          <div className="text-center">
            <span className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-semibold">
              Pagamento confirmado
            </span>
          </div>

          {/* Title */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              Crie sua senha e entre agora mesmo
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Em menos de dois minutos você já consegue acessar o app. Basta usar o e-mail da compra, criar uma senha segura e pronto.
              <strong className="text-foreground"> Esse processo vale para compras feitas pela Kirvano.</strong>
            </p>
          </div>

          {/* Instant Access Form */}
          <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 space-y-6 max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <h2 className="text-xl font-bold">Acesso instantâneo</h2>
            </div>
            <p className="text-muted-foreground">
              Digite o e-mail usado no checkout, crie uma senha de pelo menos 6 caracteres e clique em "Liberar acesso".
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail da compra</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Crie sua senha (mínimo 6 caracteres)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
              >
                {isLoading ? "Validando dados..." : "Liberar acesso"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao criar a senha você concorda com os Termos de Uso e Política de Privacidade da Habitz.
              </p>

              {feedback.message && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    feedback.type === "success"
                      ? "bg-accent/20 text-accent"
                      : feedback.type === "error"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {feedback.type === "success" && "✅ "}
                  {feedback.type === "error" && "❌ "}
                  {feedback.message}
                </div>
              )}
            </form>
          </div>

          {/* Alternative Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <a
              href={MEMBERS_AREA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-3 px-6 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Ir para a Área de Membros da Kirvano
            </a>
            <Button
              variant="ghost"
              onClick={handleResendEmail}
              className="flex-1"
            >
              Reenviar link de acesso por e-mail
            </Button>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-secondary/20 p-6 rounded-xl space-y-3">
              <h3 className="font-bold text-lg">Não achou o e-mail?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Procure por <strong className="text-foreground">"Habitz"</strong> ou <strong className="text-foreground">"Supabase"</strong> nas abas Promoções/Spam.</li>
                <li>• Adicione <strong className="text-foreground">noreply@mail.app.supabase.io</strong> aos contatos.</li>
                <li>• Se o pagamento foi via boleto/PIX, aguarde a confirmação do banco (pode levar até 20 min).</li>
              </ul>
            </div>

            <div className="bg-secondary/20 p-6 rounded-xl space-y-3">
              <h3 className="font-bold text-lg">O que já está liberado</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Plano guiado de 30 dias com os módulos completos.</li>
                <li>• Mini-hábitos personalizados e check-ins diários.</li>
                <li>• Materiais extras e lives dentro da Área de Membros.</li>
              </ul>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-accent/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-lg">Precisa de ajuda?</h3>
              <p className="text-muted-foreground text-sm">Atendemos em horário comercial via WhatsApp ou e-mail.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20acessar%20minha%20conta%20Habitz."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Falar no WhatsApp
              </a>
              <span className="text-sm text-muted-foreground">
                ou escreva para <strong className="text-foreground">contato@habitz.life</strong>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-border mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Habitz. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Obrigado;
