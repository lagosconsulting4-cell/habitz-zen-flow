import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  type Mode = "login" | "reset";
  const [mode, setMode] = useState<Mode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterAuth = useCallback(async (userId: string) => {
    const locationState = location.state as { from?: { pathname?: string } } | null;
    const preferredPath = locationState?.from?.pathname;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium, has_completed_onboarding")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      // Check and update streak on login
      try {
        await supabase.rpc("update_streak", { p_user_id: userId });
      } catch (error) {
        console.error("Failed to update streak on login:", error);
        // Don't block login on this error
      }

      // Se nao completou onboarding, redirecionar para la primeiro
      if (!data?.has_completed_onboarding) {
        navigate("/onboarding-new", { replace: true });
        return;
      }

      if (data?.is_premium) {
        const safePath =
          preferredPath && !["/auth", "/pricing", "/onboarding", "/onboarding-new"].includes(preferredPath)
            ? preferredPath
            : "/dashboard";
        navigate(safePath, { replace: true });
      } else {
        // Redirect to external /bora page (outside /app basename)
        window.location.href = "/bora";
      }
    } catch (err) {
      console.error("Failed to resolve premium status", err);
      toast.error("Nao conseguimos validar sua assinatura agora. Entrando no app mesmo assim.");
      const safePath =
        preferredPath && !["/auth", "/pricing", "/onboarding", "/onboarding-new"].includes(preferredPath)
          ? preferredPath
          : "/dashboard";
      navigate(safePath, { replace: true });
    }
  }, [navigate, location.state]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (userId && mode !== "reset") {
        redirectAfterAuth(userId);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        return;
      }
      const userId = session?.user?.id;
      if (userId && mode !== "reset") {
        redirectAfterAuth(userId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectAfterAuth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user) {
          toast.success("Login feito com sucesso");
          await redirectAfterAuth(data.user.id);
        }
      } else if (mode === "reset") {
        if (newPassword.length < 6) {
          toast.error("A nova senha deve ter ao menos 6 caracteres.");
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("As senhas não coincidem.");
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Senha atualizada com sucesso. Faça login novamente.");
        setMode("login");
      }
    } catch (error) {
      console.error("Unexpected auth error", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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

        <Card className="rounded-2xl bg-card border border-border text-foreground">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold uppercase tracking-wide">Acesse sua conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Use o email que você usou na compra
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="você@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {mode !== "reset" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              {mode === "reset" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-foreground">Nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-foreground">Confirmar nova senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repita a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === "login" ? "Entrando..." : "Salvando..."}
                  </>
                ) : (
                  mode === "login" ? "Entrar" : "Salvar nova senha"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border">
              {mode === "login" && (
                <>
                  <p className="text-muted-foreground">Precisa definir ou redefinir sua senha?</p>
                  <Button variant="link" onClick={() => navigate("/definir-senha")} className="font-semibold p-0 h-auto text-primary hover:text-primary/80">
                    Definir/Redefinir senha
                  </Button>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-muted-foreground">Ainda não tem acesso?</p>
                    <Link to="/bora" className="font-semibold text-primary hover:text-primary/80">
                      Garantir acesso agora →
                    </Link>
                  </div>
                </>
              )}
              {mode === "reset" && (
                <>
                  <p className="text-muted-foreground">Redefinindo sua senha</p>
                  <Button variant="link" onClick={() => setMode("login")} className="font-semibold p-0 h-auto text-primary hover:text-primary/80">
                    Cancelar e voltar ao login
                  </Button>
                </>
              )}
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

export default Auth;



