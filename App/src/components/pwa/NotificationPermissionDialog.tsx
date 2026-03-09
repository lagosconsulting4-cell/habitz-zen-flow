import { useState, useEffect } from "react";
import { Bell, BellOff, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

type NotificationTrigger =
  | "after-onboarding"
  | "after-first-habit"
  | "after-streak-7"
  | "after-journey-start"
  | "manual";

interface NotificationPermissionDialogProps {
  className?: string;
  trigger?: NotificationTrigger;
  onClose?: () => void;
}

/**
 * Expiration time for dismissed prompts (30 days in ms).
 * After this period, the prompt can be shown again.
 */
const DISMISS_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Check if a trigger was dismissed and the dismissal hasn't expired.
 * Returns true if the prompt should NOT be shown (still within cooldown).
 */
function isDismissedAndValid(trigger: string): boolean {
  const key = `notification-prompt-${trigger}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;

  // Legacy: old format was just "true" string
  if (raw === "true") {
    // Migrate to new format with current timestamp (starts 30-day clock)
    localStorage.setItem(key, JSON.stringify({ dismissed: true, at: Date.now() }));
    return true;
  }

  try {
    const data = JSON.parse(raw);
    if (!data.dismissed || !data.at) return false;
    // Check if 30 days have passed
    if (Date.now() - data.at > DISMISS_EXPIRATION_MS) {
      localStorage.removeItem(key); // Expired, allow re-ask
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Mark a trigger as dismissed with timestamp for expiration.
 */
function markDismissed(trigger: string): void {
  const key = `notification-prompt-${trigger}`;
  localStorage.setItem(key, JSON.stringify({ dismissed: true, at: Date.now() }));
}

export function NotificationPermissionDialog({
  className,
  trigger = "manual",
  onClose,
}: NotificationPermissionDialogProps) {
  const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const { isIOS, isStandalone } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Verificar se deve mostrar
  useEffect(() => {
    if (dismissed || isSubscribed || permission === "denied") {
      setIsVisible(false);
      return;
    }

    // iOS não instalado: não mostrar (push não funciona)
    if (isIOS && !isStandalone) {
      setIsVisible(false);
      return;
    }

    if (trigger === "manual") {
      setIsVisible(true);
      return;
    }

    // Check localStorage with 30-day expiration for automatic triggers
    if (!isDismissedAndValid(trigger) && isSupported) {
      // Delay para não mostrar imediatamente
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, isSupported, isSubscribed, permission, dismissed, isIOS, isStandalone]);

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
    if (trigger !== "manual") {
      markDismissed(trigger);
    }
    onClose?.();
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  // Mensagem especial para iOS não instalado
  if (isIOS && !isStandalone) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4",
          "bg-black/50 backdrop-blur-sm animate-in fade-in duration-300",
          className
        )}
        onClick={handleClose}
      >
        <div
          className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-300"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="notif-dialog-title-ios"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 id="notif-dialog-title-ios" className="font-semibold text-lg text-foreground">
                Instale o App Primeiro
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Para receber notificações no iPhone, você precisa adicionar o Bora
                à tela inicial primeiro.
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Fechar"
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleClose}
          >
            Entendi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm animate-in fade-in duration-300",
        className
      )}
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-300"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notif-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 id="notif-dialog-title" className="font-semibold text-lg text-foreground">
              Ativar Lembretes
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Receba lembretes para manter seus hábitos em dia e não perder sua
              sequência.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fechar"
            className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Lembretes nos horários dos seus hábitos</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Motivação para manter sua sequência</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Você pode desativar a qualquer momento</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Agora não
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? "Ativando..." : "Ativar"}
          </Button>
        </div>

        {permission === "denied" && (
          <p className="mt-3 text-xs text-center text-amber-500">
            Permissão bloqueada. Verifique as configurações do navegador.
          </p>
        )}
      </div>
    </div>
  );
}

// Botão simples para toggle de notificações (usar em Profile/Settings)
export function NotificationToggle({ className }: { className?: string }) {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { isIOS, isStandalone } = usePWA();

  // iOS não instalado
  if (isIOS && !isStandalone) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Notificações</p>
            <p className="text-xs text-muted-foreground">
              Instale o app para ativar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Notificações</p>
            <p className="text-xs text-muted-foreground">
              Não suportado neste dispositivo
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-medium">Notificações</p>
            <p className="text-xs text-amber-500">
              Bloqueado — ative nas configurações do navegador
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">Notificações</p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed ? "Lembretes ativos" : "Lembretes desativados"}
          </p>
        </div>
      </div>
      <Button
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? "..." : isSubscribed ? "Desativar" : "Ativar"}
      </Button>
    </div>
  );
}
