import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";

const PRICE_DISPLAY = "R$ 47,90";
const PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string | undefined;

const benefits = [
  "Acesso vitalicio a todos os modulos",
  "Atualizacoes e novos conteudos incluidos",
  "Dados sincronizados e seguros via Supabase",
];

const Pricing = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremium(userId ?? undefined);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!premiumLoading && isPremium) {
      navigate("/dashboard", { replace: true });
    }
  }, [isPremium, premiumLoading, navigate]);

  const handleCheckout = async () => {
    if (!userId) {
      navigate("/auth", { replace: true, state: { from: "/pricing" } });
      return;
    }

    if (!PRICE_ID) {
      toast.error("Config de pagamento ausente (VITE_STRIPE_PRICE_ID).");
      return;
    }

    setIsLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        method: "POST",
        body: {
          priceId: PRICE_ID,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      toast.error("Nao foi possivel iniciar o checkout agora.");
    } catch (err) {
      console.error("Failed to create checkout session", err);
      toast.error("Erro ao iniciar o pagamento. Tente novamente mais tarde.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full glass-card p-10 text-center space-y-6">
        <div className="space-y-3">
          <p className="uppercase text-xs tracking-widest text-muted-foreground">Plano unico</p>
          <h1 className="text-4xl font-semibold">Habitz Premium Vitalicio</h1>
          <p className="text-muted-foreground">
            Pague uma unica vez e tenha acesso completo para sempre. Gestao de habitos, meditacoes, biblioteca e trilha guiada sem limitacoes.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-5xl font-bold">
          <span>{PRICE_DISPLAY}</span>
          <span className="text-muted-foreground text-base font-normal">pagamento unico</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-left">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full rounded-xl bg-gradient-primary hover:shadow-elegant"
            onClick={handleCheckout}
            disabled={isLoadingCheckout || premiumLoading}
          >
            {isLoadingCheckout ? "Redirecionando..." : "Comprar acesso vitalicio"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Pagamento seguro processado pela Stripe. Valor unico, acesso imediato.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Acesso imediato apos pagamento</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Pricing;
