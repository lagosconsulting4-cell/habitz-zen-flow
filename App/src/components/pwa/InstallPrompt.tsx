import { useState } from "react";
import { Smartphone, Share, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const { isInstalled, isInstallable, isIOS, promptInstall } = usePWA();
  const [isLoading, setIsLoading] = useState(false);

  // Debug logs
  console.log("[InstallPrompt] Valores:", { isInstalled, isInstallable, isIOS });

  if (isInstalled) {
    console.log("[InstallPrompt] Retornando null: app instalado");
    return null;
  }

  const shouldShow = isIOS || isInstallable;
  if (!shouldShow) {
    console.log("[InstallPrompt] Retornando null: shouldShow=false");
    return null;
  }

  console.log("[InstallPrompt] ✅ RENDERIZANDO componente!");

  const handleInstall = async () => {
    setIsLoading(true);
    await promptInstall();
    setIsLoading(false);
  };

  const buttonClasses = cn(
    "fixed bottom-32 right-4 z-50",
    "w-16 h-16 rounded-full",
    "bg-primary",
    "text-primary-foreground",
    "shadow-xl hover:shadow-2xl",
    "flex items-center justify-center",
    "transition-all duration-300",
    "hover:scale-110 active:scale-95",
    "ring-4 ring-primary/20 hover:ring-primary/30",
    "group"
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={buttonClasses} aria-label="Instalar app">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Icon */}
          <Smartphone className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        </button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span>Instale o Bora</span>
          </DialogTitle>
          <DialogDescription>
            Acesso rápido, funciona offline e muito mais!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Video Tutorial - Local MP4 */}
          <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-border/50 bg-muted/30 mx-auto" style={{ maxWidth: '200px' }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-[9/16] object-cover"
            >
              <source src="/videos/install-tutorial.mp4" type="video/mp4" />
            </video>
          </div>

          {/* iOS Instructions */}
          {isIOS && (
            <div className="space-y-3 bg-muted/50 rounded-xl p-4 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Como instalar
              </h3>
              <IOSStep step={1} icon={<Share className="w-4 h-4" />} text='Toque no botão "Compartilhar"' />
              <IOSStep step={2} icon={<Plus className="w-4 h-4" />} text='Selecione "Adicionar à Tela Inicial"' />
              <IOSStep step={3} icon={<ChevronRight className="w-4 h-4" />} text='Toque em "Adicionar"' />
            </div>
          )}

          {/* Android Install Button */}
          {isInstallable && !isIOS && (
            <Button
              onClick={handleInstall}
              disabled={isLoading}
              size="lg"
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Instalando...
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5 mr-2" />
                  Instalar Agora
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for iOS steps
interface IOSStepProps {
  step: number;
  icon: React.ReactNode;
  text: string;
}

function IOSStep({ step, icon, text }: IOSStepProps) {
  return (
    <div className="flex items-center gap-3 group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
        {step}
      </div>
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground border border-border/50">
        {icon}
      </div>
      <span className="text-sm text-foreground font-medium">{text}</span>
    </div>
  );
}

// Component for update available banner
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
            <Button variant="secondary" size="sm" onClick={updateApp}>
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
