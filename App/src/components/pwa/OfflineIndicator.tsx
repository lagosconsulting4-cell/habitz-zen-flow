import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Cloud } from "lucide-react";
import { useIsOnline } from "@/hooks/useOnlineStatus";
import { hasPendingSyncItems, getPendingSyncCount } from "@/lib/offline-db";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const isOnline = useIsOnline();
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Verificar itens pendentes
  useEffect(() => {
    const checkPending = async () => {
      try {
        const hasPending = await hasPendingSyncItems();
        if (hasPending) {
          const count = await getPendingSyncCount();
          setPendingCount(count);
        } else {
          setPendingCount(0);
        }
      } catch (error) {
        console.error("[OfflineIndicator] Erro ao verificar pendências:", error);
      }
    };

    checkPending();

    // Verificar periodicamente
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  // Controlar visibilidade
  useEffect(() => {
    if (!isOnline || pendingCount > 0) {
      setIsVisible(true);
    } else {
      // Delay para esconder suavemente
      const timeout = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "safe-area-top",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium",
          !isOnline
            ? "bg-amber-500 text-white"
            : pendingCount > 0
            ? "bg-blue-500 text-white"
            : "bg-green-500 text-white"
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Você está offline</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Sincronizando {pendingCount} alteração{pendingCount !== 1 ? "ões" : ""}...</span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4" />
            <span>Dados sincronizados</span>
          </>
        )}
      </div>
    </div>
  );
}

// Badge pequeno para mostrar status no header/nav
export function OfflineBadge({ className }: { className?: string }) {
  const isOnline = useIsOnline();
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const pending = await hasPendingSyncItems();
        setHasPending(pending);
      } catch {
        setHasPending(false);
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && !hasPending) return null;

  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        !isOnline ? "bg-amber-500" : "bg-blue-500 animate-pulse",
        className
      )}
      title={!isOnline ? "Offline" : "Sincronizando..."}
    />
  );
}
