import { Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";
import { Badge } from "@/components/ui/badge";

interface FreezeBadgeProps {
  userId?: string;
  variant?: "compact" | "full";
}

/**
 * FreezeBadge Component
 *
 * Mostra o status e contador de Streak Freezes disponíveis.
 *
 * Variantes:
 * - compact: Badge pequeno para exibição inline (XPBar, etc)
 * - full: Card explicativo completo (Dashboard, Profile)
 *
 * Uso:
 * <FreezeBadge userId={user.id} variant="compact" />
 * <FreezeBadge userId={user.id} variant="full" />
 */
export function FreezeBadge({ userId, variant = "compact" }: FreezeBadgeProps) {
  const { availableFreezes, progress } = useGamification(userId);

  const hasFreeze = availableFreezes > 0;
  const streakActive = (progress?.current_streak || 0) > 0;

  // Se não tem streak ativo, não mostra
  if (!streakActive) return null;

  if (variant === "compact") {
    return (
      <Badge
        variant={hasFreeze ? "default" : "destructive"}
        className={cn(
          "gap-1 whitespace-nowrap",
          hasFreeze ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500/20 text-red-600 hover:bg-red-500/30"
        )}
        title={
          hasFreeze
            ? `Protegido! ${availableFreezes} freeze${availableFreezes !== 1 ? "s" : ""} disponível${availableFreezes !== 1 ? "is" : ""}`
            : "⚠️ Streak em risco! Sem freezes disponíveis"
        }
      >
        {hasFreeze ? (
          <ShieldCheck className="w-3 h-3 flex-shrink-0" />
        ) : (
          <Shield className="w-3 h-3 flex-shrink-0" />
        )}
        <span className="text-xs font-medium">
          {hasFreeze ? "Protegido" : "Desprotegido"}
        </span>
      </Badge>
    );
  }

  // Variante full - Card explicativo completo
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2",
        hasFreeze
          ? "bg-blue-500/10 border-blue-500/30"
          : "bg-red-500/10 border-red-500/30"
      )}
    >
      <div className="flex-shrink-0">
        {hasFreeze ? (
          <ShieldCheck className="w-6 h-6 text-blue-500" />
        ) : (
          <Shield className="w-6 h-6 text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {hasFreeze
            ? `Streak Protegido (${availableFreezes}x)`
            : "Streak Desprotegido!"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {hasFreeze
            ? "Se perder um dia, usaremos 1 freeze automaticamente para proteger seu streak"
            : "Compre freezes na loja de gems para proteger seu streak contra perdas"}
        </p>
      </div>

      {hasFreeze && (
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {availableFreezes}
            </p>
            <p className="text-[10px] text-blue-500 font-medium">
              disponível{availableFreezes !== 1 ? "is" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FreezeBadge;
