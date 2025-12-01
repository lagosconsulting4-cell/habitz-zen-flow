import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);

  // Verificar conexão real (não apenas navigator.onLine)
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Tentar fetch de um endpoint pequeno
      const response = await fetch("/manifest.json", {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("Conexão restaurada", {
          description: "Sincronizando dados...",
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.warning("Você está offline", {
        description: "As alterações serão sincronizadas quando a conexão voltar.",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    checkConnection,
  };
}

// Hook simplificado para componentes que só precisam do status
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
