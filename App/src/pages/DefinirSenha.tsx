import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
  ArrowLeft,
  Mail,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Types
type TokenStatus = "loading" | "valid" | "invalid" | "expired" | "used";
type PageMode = "token" | "email" | "recovery" | "detecting";

interface TokenValidation {
  is_valid: boolean;
  token_email: string | null;
  token_type: string | null;
  error_message: string | null;
}

interface Feedback {
  message: string;
  type: "success" | "error" | null;
}

// Constants
const PASSWORD_ENDPOINT = "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/create-password-direct";

const DefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Shared states
  const [pageMode, setPageMode] = useState<PageMode>("detecting");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ message: "", type: null });

  // Token flow states
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading");
  const [tokenEmail, setTokenEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email flow states
  const [email, setEmail] = useState("");

  // Recovery flow states
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");

  // Auto-login and redirect to onboarding (Stripe) or dashboard (normal)
  const handleSuccessfulPasswordCreation = async (userEmail: string, userPassword: string) => {
    setFeedback({ message: "Acesso liberado! Entrando...", type: "success" });
    setIsSuccess(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (error) {
        console.error("Auto-login failed:", error);
        toast.success("Conta criada! Faça login para continuar.");
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
        return;
      }

      // Success - redirect based on source
      const fromStripe = searchParams.get("from") === "stripe";
      const destination = fromStripe ? "/onboarding" : "/dashboard";
      setTimeout(() => navigate(destination, { replace: true }), 1500);
    } catch {
      toast.success("Conta criada! Faça login para continuar.");
      setTimeout(() => navigate("/auth", { replace: true }), 2000);
    }
  };

  // Detect mode and validate token if present
  useEffect(() => {
    const detectMode = async () => {
      // Check for Supabase recovery token in hash fragment
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      if (accessToken && type === "recovery") {
        // Recovery flow (Supabase password reset)
        setPageMode("recovery");
        setTokenStatus("valid");

        // Get user email from session
        const { data } = await supabase.auth.getUser();
        if (data.user?.email) {
          setRecoveryEmail(data.user.email);
        }
        return;
      }

      // Check for custom access token in query params
      const token = searchParams.get("token");

      if (token) {
        // Token flow (custom access token)
        setPageMode("token");
        validateToken(token);
      } else {
        // Email flow - no token needed
        setPageMode("email");
        setTokenStatus("valid"); // Not relevant for email mode but prevents loading state
      }
    };

    void detectMode();
  }, [searchParams]);

  // Token validation function
  const validateToken = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc("validate_access_token", {
        p_token: token,
      });

      if (error) {
        console.error("Token validation error:", error);
        setTokenStatus("invalid");
        setErrorMessage("Erro ao validar o token");
        return;
      }

      const result = data as TokenValidation[] | null;
      if (!result || result.length === 0) {
        setTokenStatus("invalid");
        setErrorMessage("Token inválido");
        return;
      }

      const validation = result[0];

      if (validation.is_valid) {
        setTokenStatus("valid");
        setTokenEmail(validation.token_email || "");
      } else {
        if (validation.error_message?.includes("expirou")) {
          setTokenStatus("expired");
        } else if (validation.error_message?.includes("utilizado")) {
          setTokenStatus("used");
        } else {
          setTokenStatus("invalid");
        }
        setErrorMessage(validation.error_message || "Token inválido");
      }
    } catch (err) {
      console.error("Unexpected token validation error:", err);
      setTokenStatus("invalid");
      setErrorMessage("Erro inesperado ao validar o token");
    }
  };

  // Token flow submit handler
  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = searchParams.get("token");

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    setFeedback({ message: "Criando sua conta...", type: null });

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tokenEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`,
          data: {
            email_confirmed: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setFeedback({
            message: "Este email já possui uma conta. Faça login ou use 'Esqueci minha senha'.",
            type: "error"
          });
          setIsLoading(false);
          return;
        }
        throw signUpError;
      }

      // Consume the token
      await supabase.rpc("consume_access_token", { p_token: token });

      // Mark user as premium
      if (signUpData.user) {
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("user_id", signUpData.user.id);
      }

      // Auto-login and redirect
      await handleSuccessfulPasswordCreation(tokenEmail, password);
    } catch (err) {
      console.error("Account creation error:", err);
      setFeedback({ message: "Erro ao criar conta. Tente novamente.", type: "error" });
      setIsLoading(false);
    }
  };

  // Recovery flow submit handler (Supabase password reset)
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    setFeedback({ message: "Atualizando sua senha...", type: null });

    try {
      // Update password using Supabase recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          has_set_password: true,
        },
      });

      if (updateError) {
        throw updateError;
      }

      setFeedback({ message: "Senha atualizada! Redirecionando...", type: "success" });

      // Auto-login and redirect
      await handleSuccessfulPasswordCreation(recoveryEmail, password);
    } catch (err) {
      console.error("Password recovery error:", err);
      setFeedback({
        message: err instanceof Error ? err.message : "Erro ao redefinir senha. Tente novamente.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  // Email flow submit handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFeedback({ message: "Digite um e-mail válido.", type: "error" });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setFeedback({ message: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
      return;
    }

    setIsLoading(true);
    setFeedback({ message: "Verificando pagamento...", type: null });

    try {
      const response = await fetch(PASSWORD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível liberar o acesso.");
      }

      // Auto-login and redirect
      await handleSuccessfulPasswordCreation(email.trim(), password.trim());
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Erro ao liberar acesso.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  // Feedback component
  const FeedbackMessage = () => (
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
          {feedback.type === "success" && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
          {feedback.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          {!feedback.type && <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />}
          <span className="text-sm">{feedback.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading state (detecting mode or validating token)
  if (pageMode === "detecting" || (pageMode === "token" && tokenStatus === "loading")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando seu acesso...</p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Liberado!</h1>
          <p className="text-muted-foreground mb-6">
            {searchParams.get("from") === "stripe"
              ? "Preparando seu onboarding personalizado..."
              : "Entrando no seu programa de 30 dias..."}
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Redirecionando...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Token invalid/expired/used states
  if (pageMode === "token" && tokenStatus !== "valid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto mb-6">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {tokenStatus === "expired" && "Link Expirado"}
            {tokenStatus === "used" && "Link Já Utilizado"}
            {tokenStatus === "invalid" && "Link Inválido"}
          </h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate("/auth")} className="w-full">
              Ir para Login
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPageMode("email");
                setTokenStatus("valid");
              }}
              className="w-full"
            >
              Tentar com email da compra
            </Button>
            <p className="text-sm text-muted-foreground">
              Se você já criou sua conta, faça login normalmente.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Recovery flow form (Supabase password reset)
  if (pageMode === "recovery") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted mb-6 flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para inicio
          </Button>

          <Card className="rounded-2xl bg-card border border-border text-foreground overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

            <CardHeader className="space-y-4 text-center pt-8">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
              <CardDescription className="text-muted-foreground">
                Crie uma nova senha para sua conta
              </CardDescription>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  Email: <span className="font-medium text-foreground">{recoveryEmail}</span>
                </p>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Nova Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Atualizando senha...
                    </>
                  ) : (
                    "Atualizar Senha"
                  )}
                </Button>

                <FeedbackMessage />
              </form>

              <div className="text-center pt-6 border-t border-border mt-6">
                <p className="text-muted-foreground text-sm">Lembrou sua senha?</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="font-semibold p-0 h-auto text-primary hover:text-primary/80"
                >
                  Voltar para login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Email flow form
  if (pageMode === "email") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted mb-6 flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para inicio
          </Button>

          <Card className="rounded-2xl bg-card border border-border text-foreground overflow-hidden">
            {/* Header with gradient accent */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

            <CardHeader className="space-y-4 text-center pt-8">
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                Libere seu Acesso
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Use o email da sua compra e crie uma senha para acessar o programa de 30 dias.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {/* Email input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    E-mail da compra
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Password input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Crie sua senha (mínimo 6 caracteres)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Liberar Acesso"
                  )}
                </Button>

                {/* Feedback */}
                <FeedbackMessage />

                {/* Terms */}
                <p className="text-xs text-muted-foreground text-center">
                  Ao criar a senha você concorda com os{" "}
                  <Link to="/terms" className="text-primary underline hover:text-primary/80">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </form>

              <div className="text-center pt-6 border-t border-border mt-6">
                <p className="text-muted-foreground text-sm">Já tem uma conta?</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/auth")}
                  className="font-semibold p-0 h-auto text-primary hover:text-primary/80"
                >
                  Fazer login
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help text */}
          <motion.div
            className="mt-6 p-4 rounded-xl bg-muted/50 border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Problemas para acessar?</strong>
              <br />
              Certifique-se de usar o mesmo email da compra.
              <br />
              <a
                href="https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Preciso%20de%20ajuda%20para%20acessar%20minha%20conta%20BORA."
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Falar no WhatsApp
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Token flow form (valid token)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted mb-6 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para inicio
        </Button>

        <Card className="rounded-2xl bg-card border border-border text-foreground overflow-hidden">
          {/* Header with gradient accent */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

          <CardHeader className="space-y-4 text-center pt-8">
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Crie sua Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua compra foi confirmada! Agora crie uma senha para acessar
              seu programa de 30 dias para TDAH.
            </CardDescription>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium text-foreground">{tokenEmail}</span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Confirmar Senha
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta e Acessar"
                )}
              </Button>

              {/* Feedback */}
              <FeedbackMessage />
            </form>

            <div className="text-center pt-6 border-t border-border mt-6">
              <p className="text-muted-foreground text-sm">Já tem uma conta?</p>
              <Button
                variant="link"
                onClick={() => navigate("/auth")}
                className="font-semibold p-0 h-auto text-primary hover:text-primary/80"
              >
                Fazer login
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Ao continuar, você concorda com nossos{" "}
            <Link to="/terms" className="text-primary underline hover:text-primary/80">
              Termos de Uso
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DefinirSenha;
