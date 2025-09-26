import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterAuth = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      const locationState = location.state as { from?: { pathname?: string } } | null;
      const preferredPath = locationState?.from?.pathname;

      if (data?.is_premium) {
        const safePath = preferredPath && !["/auth", "/pricing"].includes(preferredPath) ? preferredPath : "/dashboard";
        navigate(safePath, { replace: true });
      } else {
        navigate("/pricing", { replace: true });
      }
    } catch (err) {
      console.error("Failed to resolve premium status", err);
      navigate("/pricing", { replace: true });
    }
  }, [navigate, location.state]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (userId) {
        redirectAfterAuth(userId);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const userId = session?.user?.id;
      if (userId) {
        redirectAfterAuth(userId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [redirectAfterAuth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
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
      } else {
        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: name.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email ja esta cadastrado. Faca login.");
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user) {
          toast.success("Conta criada! Verifique seu email para confirmar e finalize a compra.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error("Unexpected auth error", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast.error("Erro ao fazer login com Google");
      }
    } catch (error) {
      console.error("Unexpected Google auth error", error);
      toast.error("Erro inesperado com Google");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white mb-6 flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para inicio
        </Button>

        <Card className="glass-card border-white/10 bg-white/10 text-white">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Acesse o Habitz Premium</CardTitle>
            <CardDescription className="text-white/80">
              Plano unico por R$ 47,90. Entre ou crie sua conta para liberar o acesso vitalicio.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full py-3 border-border/50 hover:bg-muted/50"
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com Google
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-sm">ou</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="pl-10 py-3"
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={isLogin ? "Sua senha" : "Minimo 6 caracteres"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 py-3"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  isLogin ? "Entrar" : "Criar conta"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-muted-foreground">
                {isLogin ? "Ainda nao tem conta?" : "Ja tem conta?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold p-0 h-auto"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <p className="text-white/70 text-sm">
            Ao continuar, voce concorda com nossos
            <Button variant="link" className="text-white underline p-0 h-auto text-sm">
              Termos de Uso
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;



