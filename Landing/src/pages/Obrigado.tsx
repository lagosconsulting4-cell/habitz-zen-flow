import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Rocket,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Gift,
  Search,
  ExternalLink,
  AlertCircle,
  Loader2,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import {
  buttonHoverTap,
  springTransition,
  staggerContainer,
  staggerItem,
} from "@/hooks/useAnimations";

const PASSWORD_ENDPOINT = "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/create-password-direct";
const APP_URL = "https://habitz.life/app";
const MEMBERS_AREA_URL = "https://app.kirvano.com/";

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
  }
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
}

const Confetti = () => {
  const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ["#A3E635", "#22C55E", "#3B82F6", "#F59E0B", "#EC4899"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: "100vh",
            opacity: 0,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
};

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  index: number;
}

const InfoCard = ({ icon: Icon, title, items, index }: InfoCardProps) => (
  <motion.div
    className="glass-card p-6 space-y-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-3">
      <div className="icon-container icon-container-md">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const Obrigado = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    // Track Lead event on page load
    if (window.fbq) {
      window.fbq("track", "Lead");
    }
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFeedback({ message: "Digite um e-mail válido.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setFeedback({ message: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: "Verificando pagamento...", type: null });

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti celebration */}
      {showConfetti && <Confetti />}

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-30" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <header className="relative z-10 w-full py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.span
            className="text-2xl font-bold gradient-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Habitz
          </motion.span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-12">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Success Badge with Celebration */}
          <motion.div className="text-center" variants={staggerItem}>
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 border border-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springTransition}
            >
              <PartyPopper className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">Pagamento confirmado!</span>
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div className="text-center space-y-4" variants={staggerItem}>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Crie sua senha e
              <span className="block gradient-text mt-2">entre agora mesmo</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em menos de dois minutos você já consegue acessar o app. Basta usar o e-mail da compra, criar uma senha segura e pronto.
              <strong className="text-foreground"> Esse processo vale para compras feitas pela Kirvano.</strong>
            </p>
          </motion.div>

          {/* Instant Access Form */}
          <motion.div
            className="glass-card p-8 md:p-10 space-y-6 max-w-xl mx-auto"
            variants={staggerItem}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="icon-container icon-container-lg"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={springTransition}
              >
                <Rocket className="h-7 w-7 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">Acesso instantâneo</h2>
                <p className="text-sm text-muted-foreground">
                  Sua conta será criada automaticamente
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-mail da compra
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Crie sua senha (mínimo 6 caracteres)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="h-12 text-base"
                />
              </div>

              <motion.div {...buttonHoverTap}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="premium"
                  size="xl"
                  className="w-full group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <span>Validando dados...</span>
                    </>
                  ) : (
                    <>
                      <span>Liberar acesso</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-muted-foreground text-center">
                Ao criar a senha você concorda com os Termos de Uso e Política de Privacidade da Habitz.
              </p>

              {/* Feedback message */}
              <AnimatePresence mode="wait">
                {feedback.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      feedback.type === "success"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : feedback.type === "error"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {feedback.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
                    {feedback.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                    {!feedback.type && <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />}
                    <span className="text-sm">{feedback.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Alternative Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto"
            variants={staggerItem}
          >
            <motion.a
              href={MEMBERS_AREA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 glass-card hover:bg-muted/50 transition-colors text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Área de Membros Kirvano</span>
            </motion.a>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="glass"
                onClick={handleResendEmail}
                className="flex-1 w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Reenviar link por e-mail
              </Button>
            </motion.div>
          </motion.div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <InfoCard
              icon={Search}
              title="Não achou o e-mail?"
              items={[
                <>Procure por <strong className="text-foreground">"Habitz"</strong> ou <strong className="text-foreground">"Supabase"</strong> nas abas Promoções/Spam.</>,
                <>Adicione <strong className="text-foreground">noreply@mail.app.supabase.io</strong> aos contatos.</>,
                "Se o pagamento foi via boleto/PIX, aguarde a confirmação do banco (pode levar até 20 min).",
              ]}
              index={0}
            />

            <InfoCard
              icon={Gift}
              title="O que já está liberado"
              items={[
                "Plano guiado de 30 dias com os módulos completos.",
                "Mini-hábitos personalizados e check-ins diários.",
                "Materiais extras e lives dentro da Área de Membros.",
              ]}
              index={1}
            />
          </div>

          {/* Support Card */}
          <motion.div
            className="glass-card p-6 md:p-8 max-w-3xl mx-auto border-l-4 border-primary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="icon-container icon-container-lg">
                  <HelpCircle className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Precisa de ajuda?</h3>
                  <p className="text-muted-foreground text-sm">
                    Atendemos em horário comercial via WhatsApp ou e-mail.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <motion.a
                  href="https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20acessar%20minha%20conta%20Habitz."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Falar no WhatsApp
                </motion.a>
                <span className="text-sm text-muted-foreground">
                  ou escreva para <strong className="text-foreground">contato@habitz.life</strong>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            © {new Date().getFullYear()} Habitz. Todos os direitos reservados.
          </motion.p>
        </div>
      </footer>
    </div>
  );
};

export default Obrigado;
