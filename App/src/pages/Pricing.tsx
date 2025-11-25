import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Shield, Zap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";

const PRICE_DISPLAY = "R$ 47,90";
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/ZkOYIlG";

const benefits = [
  "Programa completo de 30 dias para TDAH",
  "Mini-hábitos personalizados para seu perfil",
  "Acesso vitalício a todos os módulos e conteúdos",
  "Atualizações e novos materiais incluídos",
  "Suporte baseado em técnicas comprovadas",
  "Dados sincronizados e seguros",
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

    void loadUser();
  }, []);

  useEffect(() => {
    if (!premiumLoading && isPremium) {
      navigate("/dashboard", { replace: true });
    }
  }, [isPremium, premiumLoading, navigate]);

  const handleCheckout = () => {
    // Abrir checkout da Kiwify direto, mesmo sem login
    setIsLoadingCheckout(true);
    try {
      window.location.href = KIWIFY_CHECKOUT_URL;
    } catch (error) {
      console.error("Failed to open Kiwify checkout", error);
      toast.error("Não foi possível abrir o checkout agora. Tente novamente.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        <Card className="rounded-2xl bg-card border border-border p-10 text-center space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="uppercase text-xs tracking-widest text-muted-foreground">Plano Personalizado</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide text-foreground">Programa Completo para TDAH</h1>
            <p className="text-muted-foreground">
              Pague uma única vez e tenha acesso vitalício ao seu plano personalizado. Técnicas comprovadas, mini-hábitos e suporte contínuo para transformar sua rotina em 30 dias.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-5xl font-bold text-foreground">
            <span>{PRICE_DISPLAY}</span>
            <span className="text-muted-foreground text-base font-normal">pagamento único</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-left">
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
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              onClick={handleCheckout}
              disabled={isLoadingCheckout || premiumLoading}
            >
              {isLoadingCheckout ? "Abrindo checkout..." : "Quero meu Plano Personalizado"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Pagamento seguro processado pela Kiwify. Valor único, acesso imediato.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary" />
              <span>Garantia de 7 dias</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              <span>Acesso imediato após pagamento</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Pricing;

