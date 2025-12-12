import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/ZkOYIlG";

const Thanks = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const { isPremium, loading, refresh } = usePremium(userId ?? undefined);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        setUserId(user.id);
        setUserEmail(user.email ?? "");

        // Check if user needs to set password
        // Users created via webhook have email_confirm=true but no password
        // We detect this by checking if they've set a password before
        const hasSetPassword = user.user_metadata?.has_set_password === true;
        setNeedsPassword(!hasSetPassword);
      } else {
        setUserId(null);
      }
    };

    void loadUser();
  }, []);

  const handleGoToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleGoToCheckout = () => {
    window.open(KIWIFY_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  const handleRefreshStatus = async () => {
    await refresh();
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsCreatingPassword(true);

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: {
          has_set_password: true,
        },
      });

      if (updateError) {
        toast.error("Erro ao criar senha: " + updateError.message);
        return;
      }

      toast.success("✅ Senha criada com sucesso!");

      // Auto-login with new password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (signInError) {
        toast.error("Senha criada, mas erro ao fazer login. Tente fazer login manualmente.");
        navigate("/auth");
        return;
      }

      // Password set successfully, navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Unexpected error creating password", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsCreatingPassword(false);
    }
  };

  const handleSkipPasswordCreation = () => {
    toast.info("Você receberá um email com o link para criar sua senha");
    navigate("/dashboard", { replace: true });
  };

  const renderContent = () => {
    if (!userId) {
      return (
        <>
          <h1 className="text-2xl font-semibold">Pagamento concluído!</h1>
          <p className="text-muted-foreground">
            Entre com a mesma conta usada no checkout para acessar seu Plano Personalizado completo.
          </p>
          <Button
            className="w-full"
            onClick={() => navigate("/auth", { replace: true, state: { from: "/thanks" } })}
          >
            Fazer login
          </Button>
        </>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Confirmando seu pagamento...</p>
        </div>
      );
    }

    if (isPremium) {
      // Show password creation form if user needs to set password
      if (needsPassword) {
        return (
          <div className="flex flex-col gap-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-semibold">🎉 Pagamento confirmado!</h1>
            <p className="text-muted-foreground">
              Defina sua senha para acessar seu plano agora
            </p>

            <form onSubmit={handleCreatePassword} className="space-y-4 mt-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="pl-10 py-3 bg-secondary/50 border-border text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 py-3 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isCreatingPassword}
              >
                {isCreatingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando senha...
                  </>
                ) : (
                  "Criar minha senha e acessar"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Prefere criar depois?</p>
              <Button
                variant="link"
                onClick={handleSkipPasswordCreation}
                className="text-primary hover:text-primary/80"
              >
                Criar depois (vou usar o email) →
              </Button>
            </div>
          </div>
        );
      }

      // User already has password, show dashboard button
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-semibold">Acesso liberado</h1>
          <p className="text-muted-foreground">
            Tudo pronto! Seu Plano Personalizado já está ativo. Clique abaixo para começar sua jornada de 30 dias.
          </p>
          <Button className="w-full" onClick={handleGoToDashboard}>
            Ir para o dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Clock className="w-12 h-12 text-amber-500" />
        <h1 className="text-2xl font-semibold">Estamos finalizando</h1>
        <p className="text-muted-foreground">
          Recebemos o pagamento e estamos atualizando seu acesso. Isso costuma levar poucos segundos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={handleRefreshStatus}>
            Atualizar status
          </Button>
          <Button className="flex-1" onClick={handleGoToCheckout}>
            Voltar para o checkout
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-xl w-full glass-card p-10 space-y-6 text-center">
        {renderContent()}
      </Card>
    </div>
  );
};

export default Thanks;
