import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import {
  Snowflake,
  Shield,
  Gem,
  Lock,
  AlertCircle,
  ShoppingCart,
  Clock,
  Info,
} from "lucide-react";

/**
 * DESIGN PRINCIPLES (Duolingo-Inspired):
 *
 * 1. Hierarquia Visual Clara
 *    - Hero section com ícone grande do freeze (❄️ 3D effect)
 *    - Título chamativo: "Proteja Sua Sequência"
 *    - Subtítulo explicativo: "Não perca seu progresso se esquecer um dia"
 *
 * 2. Cores Estratégicas
 *    - Azul gelo (#60A5FA, #3B82F6) para freeze (confiança, proteção)
 *    - Verde para confirmação (#22C55E)
 *    - Vermelho/laranja para urgência quando sem freezes (#EF4444, #F97316)
 *    - Gradientes sutis para depth
 *
 * 3. Iconografia Clara
 *    - Shield (🛡️) para proteção
 *    - Snowflake (❄️) para freeze
 *    - Check (✓) para compra bem-sucedida
 *    - Trophy (🏆) para streak
 *
 * 4. Call-to-Action Efetivo
 *    - Botão primário grande: "Comprar por 200 Gems"
 *    - Estado desabilitado claro quando sem gems
 *    - Feedback imediato após compra (toast + animação)
 *
 * 5. Limitação Semanal Visível
 *    - Badge destacado: "X/3 esta semana"
 *    - Progress bar visual
 *    - Mensagem quando atingir limite: "Volte na próxima semana!"
 */

interface FreezeShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const FreezeShopModal = ({ isOpen, onClose, userId }: FreezeShopModalProps) => {
  const {
    gemsBalance,
    streakFreezes,
    purchaseStreakFreeze,
    isPurchasingFreeze,
    progress,
    weeklyFreezePurchases,
  } = useGamification(userId);

  const WEEKLY_LIMIT = 3;
  const currentGems = gemsBalance || 0;
  const availableFreezes = streakFreezes?.available_freezes || 0;
  const currentStreak = progress?.current_streak || 0;
  const weeklyPurchases = weeklyFreezePurchases?.count || 0;

  const canAfford = currentGems >= 200;
  const canPurchase = canAfford && weeklyPurchases < WEEKLY_LIMIT;

  const handlePurchase = async () => {
    if (!canPurchase) return;
    try {
      await purchaseStreakFreeze();
    } catch (error) {
      console.error('Erro ao comprar freeze:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="freeze-shop-description">
        <VisuallyHidden>
          <DialogTitle>Loja de Streak Freezes</DialogTitle>
        </VisuallyHidden>
        {/* Hero Section with 3D Effect */}
        <div className="flex flex-col items-center text-center py-6" id="freeze-shop-description">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-30 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-full p-8">
              <Snowflake className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Proteja Sua Sequência</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Um freeze permite que você pule um dia sem perder sua sequência de {currentStreak} dias
          </p>
        </div>

        {/* Inventory Status */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Freezes Disponíveis</span>
            </div>
            <Badge variant={availableFreezes > 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
              {availableFreezes}
            </Badge>
          </div>

          {/* Weekly Limit Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Compras esta semana</span>
              <span className="font-semibold">{weeklyPurchases}/{WEEKLY_LIMIT}</span>
            </div>
            <Progress value={(weeklyPurchases / WEEKLY_LIMIT) * 100} className="h-2" />
          </div>
        </div>

        {/* Purchase Section */}
        <div className="space-y-4">
          {/* Price Display */}
          <div className="flex items-center justify-between p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Snowflake className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Streak Freeze</p>
                <p className="text-xs text-muted-foreground">Proteção por 1 dia</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-bold">200</span>
            </div>
          </div>

          {/* Current Balance */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">Seu saldo:</span>
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{currentGems} gems</span>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            size="lg"
            className="w-full"
            disabled={!canPurchase || isPurchasingFreeze}
            onClick={handlePurchase}
          >
            {weeklyPurchases >= WEEKLY_LIMIT ? (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Limite Semanal Atingido
              </>
            ) : !canAfford ? (
              <>
                <AlertCircle className="mr-2 h-5 w-5" />
                Gems Insuficientes
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Comprar por 200 Gems
              </>
            )}
          </Button>

          {/* Helper Messages */}
          {weeklyPurchases >= WEEKLY_LIMIT && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Limite Semanal</AlertTitle>
              <AlertDescription>
                Você já comprou {WEEKLY_LIMIT} freezes esta semana. Volte na próxima semana!
              </AlertDescription>
            </Alert>
          )}

          {!canAfford && weeklyPurchases < WEEKLY_LIMIT && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gems Insuficientes</AlertTitle>
              <AlertDescription>
                Você precisa de {200 - currentGems} gems a mais. Complete hábitos para ganhar gems!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
              <p><strong>Como funciona:</strong> Se você esquecer de completar um hábito, seu freeze será consumido automaticamente para proteger sua sequência.</p>
              <p><strong>Limite:</strong> Máximo de 3 compras por semana para manter o desafio equilibrado.</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <DialogClose asChild>
          <Button variant="ghost" className="w-full text-muted-foreground">
            Fechar
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
