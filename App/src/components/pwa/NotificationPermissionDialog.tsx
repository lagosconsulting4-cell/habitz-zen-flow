import { useState, useEffect } from "react";
import { Bell, BellOff, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

interface NotificationPermissionDialogProps {
  className?: string;
  // Quando mostrar: "after-onboarding" | "after-first-habit" | "manual"
  trigger?: "after-onboarding" | "after-first-habit" | "manual";
  onClose?: () => void;
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
    // Log de debug para diagnóstico
    console.log("[NotificationDialog] Verificando exibição:", {
      dismissed,
      isSubscribed,
      permission,
      isIOS,
      isStandalone,
      isSupported,
      trigger,
    });

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

    // Verificar localStorage para triggers automáticos
    const key = `notification-prompt-${trigger}`;
    const alreadyShown = localStorage.getItem(key);

    if (!alreadyShown && isSupported) {
      // Delay para não mostrar imediatamente
      const timeout = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem(key, "true");
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, isSupported, isSubscribed, permission, dismissed, isIOS, isStandalone]);

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
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
      >
        <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">
                Instale o App Primeiro
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Para receber notificações no iPhone, você precisa adicionar o Bora
                à tela inicial primeiro.
              </p>
            </div>
            <button
              onClick={handleClose}
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
    >
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">
              Ativar Lembretes
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Receba lembretes para manter seus hábitos em dia e não perder sua
              sequência.
            </p>
          </div>
          <button
            onClick={handleClose}
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
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
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
