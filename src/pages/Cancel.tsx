import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/ZkOYIlG";

const Cancel = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { isPremium, loading } = usePremium(userId ?? undefined);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    void loadUser();
  }, []);

  const handleRetryCheckout = () => {
    window.open(KIWIFY_CHECKOUT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-xl w-full glass-card p-10 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <ShieldOff className="w-12 h-12 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Checkout cancelado</h1>
          <p className="text-muted-foreground">
            Sem problemas. Quando estiver pronto, basta clicar no botão abaixo para voltar ao checkout e garantir seu Plano Personalizado.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={handleRetryCheckout}>
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(isPremium ? "/dashboard" : "/", { replace: true })}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isPremium ? (
              "Ir para o dashboard"
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao início</span>
              </div>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Cancel;
