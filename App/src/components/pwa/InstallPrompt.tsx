import { useState } from "react";
import { X, Share, Plus, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA, useIOSInstallPrompt } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWA();
  const { shouldShow: shouldShowIOS, dismiss: dismissIOS } = useIOSInstallPrompt();
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Se já instalado ou dispensado, não mostrar
  if (isInstalled || dismissed) return null;

  // Android/Chrome - mostrar prompt nativo
  if (isInstallable) {
    const handleInstall = async () => {
      setIsLoading(true);
      const success = await promptInstall();
      setIsLoading(false);
      if (!success) {
        // Se recusou, podemos esconder o banner por um tempo
        setDismissed(true);
        sessionStorage.setItem("pwa-prompt-dismissed", "true");
      }
    };

    return (
      <div
        className={cn(
          "fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Instalar Bora</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Adicione à tela inicial para acesso rápido
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setDismissed(true)}
            >
              Agora não
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleInstall}
              disabled={isLoading}
            >
              {isLoading ? "Instalando..." : "Instalar"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // iOS - mostrar instruções
  if (isIOS && shouldShowIOS) {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                Adicionar à Tela Inicial
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Para a melhor experiência no iPhone
              </p>
            </div>
            <button
              onClick={dismissIOS}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <IOSStep
              step={1}
              icon={<Share className="w-4 h-4" />}
              text='Toque no botão "Compartilhar"'
            />
            <IOSStep
              step={2}
              icon={<Plus className="w-4 h-4" />}
              text='Selecione "Adicionar à Tela Inicial"'
            />
            <IOSStep
              step={3}
              icon={<ChevronRight className="w-4 h-4" />}
              text='Toque em "Adicionar"'
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={dismissIOS}
          >
            Entendi
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

interface IOSStepProps {
  step: number;
  icon: React.ReactNode;
  text: string;
}

function IOSStep({ step, icon, text }: IOSStepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
        {step}
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

// Componente para banner de atualização disponível
export function UpdatePrompt() {
  const { needsUpdate, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!needsUpdate || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-semibold">Nova versão disponível</h3>
            <p className="text-sm opacity-90 mt-0.5">
              Atualize para ter as últimas melhorias
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/20"
              onClick={() => setDismissed(true)}
            >
              Depois
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={updateApp}
            >
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
