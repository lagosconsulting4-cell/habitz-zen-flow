import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Sparkles, TrendingUp, Palette, Cloud, BookOpen, X } from "lucide-react";

interface UpgradePromptProps {
  currentHabits: number;
  maxFreeHabits: number;
  onUpgrade?: () => void;
}

const UpgradePrompt = ({ currentHabits, maxFreeHabits, onUpgrade }: UpgradePromptProps) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const isAtLimit = currentHabits >= maxFreeHabits;

  const premiumFeatures = [
    {
      icon: Sparkles,
      title: "Hábitos Ilimitados",
      description: "Crie quantos hábitos quiser, sem limitações"
    },
    {
      icon: Palette,
      title: "Temas Premium",
      description: "Personalize a interface com cores exclusivas"
    },
    {
      icon: TrendingUp,
      title: "Relatórios Avançados",
      description: "Análises mensais detalhadas do seu progresso"
    },
    {
      icon: BookOpen,
      title: "Modo Guiado",
      description: "Trilha de 4 semanas com objetivos progressivos"
    },
    {
      icon: Crown,
      title: "Conteúdos Exclusivos",
      description: "Playlists, PDFs e áudios motivacionais"
    },
    {
      icon: Cloud,
      title: "Backup na Nuvem",
      description: "Seus dados sempre seguros e sincronizados"
    }
  ];

  if (!isAtLimit) {
    return (
      <Card className="glass-card p-4 border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                {currentHabits}/{maxFreeHabits} hábitos gratuitos
              </p>
              <p className="text-xs text-muted-foreground">
                Desbloqueie o potencial completo
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowUpgradeModal(true)}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Upgrade
          </Button>
        </div>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Crown className="w-6 h-6 text-primary" />
                Habitz Premium
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {premiumFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="bg-gradient-primary rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Plano Anual Premium</h3>
                    <p className="text-white/80 text-sm">Desenvolvimento completo</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Mais Popular
                  </Badge>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">R$ 247</span>
                  <span className="text-white/80">/ano</span>
                  <span className="text-white/60 text-sm line-through">R$ 348</span>
                </div>
                
                <p className="text-white/80 text-sm mb-6">
                  Ou em até 6x de R$ 41,17 sem juros
                </p>
                
                <Button 
                  className="w-full bg-white text-primary hover:bg-white/90 font-medium"
                  size="lg"
                  onClick={() => {
                    onUpgrade?.();
                    setShowUpgradeModal(false);
                  }}
                >
                  Assinar Premium
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Garantia de 7 dias. Cancele quando quiser.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // Blocking prompt when at limit
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 p-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Crown className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Limite de Hábitos Atingido</h3>
          <p className="text-muted-foreground">
            Você atingiu o limite de {maxFreeHabits} hábitos gratuitos.
            <br />
            Faça upgrade para criar hábitos ilimitados!
          </p>
        </div>

        <Button 
          className="bg-primary hover:bg-primary/90"
          size="lg"
          onClick={() => setShowUpgradeModal(true)}
        >
          <Crown className="w-4 h-4 mr-2" />
          Fazer Upgrade Agora
        </Button>

        {/* Same modal as above */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Crown className="w-6 h-6 text-primary" />
                Habitz Premium
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* ... same content as above */}
              <div className="grid md:grid-cols-2 gap-4">
                {premiumFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-primary rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Plano Anual Premium</h3>
                    <p className="text-white/80 text-sm">Desenvolvimento completo</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Mais Popular
                  </Badge>
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">R$ 247</span>
                  <span className="text-white/80">/ano</span>
                  <span className="text-white/60 text-sm line-through">R$ 348</span>
                </div>
                
                <p className="text-white/80 text-sm mb-6">
                  Ou em até 6x de R$ 41,17 sem juros
                </p>
                
                <Button 
                  className="w-full bg-white text-primary hover:bg-white/90 font-medium"
                  size="lg"
                  onClick={() => {
                    onUpgrade?.();
                    setShowUpgradeModal(false);
                  }}
                >
                  Assinar Premium
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Garantia de 7 dias. Cancele quando quiser.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default UpgradePrompt;