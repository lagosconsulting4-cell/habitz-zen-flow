import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/ZkOYIlG";

const Thanks = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { isPremium, loading, refresh } = usePremium(userId ?? undefined);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
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

  const renderContent = () => {
    if (!userId) {
      return (
        <>
          <h1 className="text-2xl font-semibold">Pagamento concluído!</h1>
          <p className="text-muted-foreground">
            Entre com a mesma conta usada no checkout para acessar o Habitz premium vitalício.
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
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-semibold">Acesso liberado</h1>
          <p className="text-muted-foreground">
            Tudo pronto! Seu acesso vitalício já está ativo. Clique abaixo para entrar no app.
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
