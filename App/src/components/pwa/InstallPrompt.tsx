import { useState, useEffect, useRef } from "react";
import { Smartphone, Share, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

export function InstallPrompt() {
  const { isInstalled, isInstallable, isIOS, promptInstall } = usePWA();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snap, setSnap] = useState<number | string | null>(0.2);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Logs de debug
  console.log("[InstallPrompt] Valores recebidos:", { isInstalled, isInstallable, isIOS });

  // ÚNICA condição para esconder: app instalado
  if (isInstalled) {
    console.log("[InstallPrompt] Retornando null: app instalado (isInstalled=true)");
    return null;
  }

  // Mostrar para iOS (sempre) ou Android (quando installable)
  const shouldShow = isIOS || isInstallable;
  console.log("[InstallPrompt] shouldShow =", shouldShow, "(isIOS:", isIOS, "|| isInstallable:", isInstallable, ")");
  if (!shouldShow) {
    console.log("[InstallPrompt] Retornando null: shouldShow=false");
    return null;
  }

  console.log("[InstallPrompt] ✅ RENDERIZANDO componente!");

  const isExpanded = snap === 0.6;

  const handleInstall = async () => {
    setIsLoading(true);
    await promptInstall();
    setIsLoading(false);
  };

  // DEBUG: Log element visibility after render
  useEffect(() => {
    if (buttonRef.current) {
      console.log("[InstallPrompt] ✅ Button element found in DOM!");
      console.log("[InstallPrompt] Button computed style:", {
        display: window.getComputedStyle(buttonRef.current).display,
        visibility: window.getComputedStyle(buttonRef.current).visibility,
        opacity: window.getComputedStyle(buttonRef.current).opacity,
        position: window.getComputedStyle(buttonRef.current).position,
        bottom: window.getComputedStyle(buttonRef.current).bottom,
        right: window.getComputedStyle(buttonRef.current).right,
        zIndex: window.getComputedStyle(buttonRef.current).zIndex,
        width: window.getComputedStyle(buttonRef.current).width,
        height: window.getComputedStyle(buttonRef.current).height,
        backgroundColor: window.getComputedStyle(buttonRef.current).backgroundColor,
      });
      console.log("[InstallPrompt] Button rect:", buttonRef.current.getBoundingClientRect());
      console.log("[InstallPrompt] Button element:", buttonRef.current);
    } else {
      console.log("[InstallPrompt] ❌ Button element NOT found in DOM!");
    }
  }, []);

  // DEBUG: Log drawer state changes
  useEffect(() => {
    console.log("[InstallPrompt] drawerOpen state changed:", drawerOpen);
    console.log("[InstallPrompt] snap state changed:", snap);
  }, [drawerOpen, snap]);

  // DEBUG: Log do className
  const buttonClasses = cn(
    "fixed bottom-32 right-4 z-50",
    "w-16 h-16 rounded-full",
    "bg-red-500", // DEBUG: Vermelho temporário para visibilidade!
    "text-primary-foreground",
    "shadow-xl hover:shadow-2xl",
    "flex items-center justify-center",
    "transition-all duration-300",
    "hover:scale-110 active:scale-95",
    "ring-4 ring-primary/20 hover:ring-primary/30",
    "group"
    // REMOVER: "relative overflow-hidden" foram movidas para elementos filhos
  );
  console.log("[InstallPrompt] className gerado:", buttonClasses);

  return (
    <>
      {/* FAB - 100% persistente */}
      <button
        ref={buttonRef}
        onClick={() => {
          console.log("[InstallPrompt] ✅ BUTTON CLICKED!");
          console.log("[InstallPrompt] Current drawerOpen state:", drawerOpen);
          setDrawerOpen(true);
          setSnap(0.2);
          console.log("[InstallPrompt] setState called for drawerOpen");
        }}
        className={buttonClasses}
        aria-label="Instalar app"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon with animation */}
        <Smartphone className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />

        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </button>

      {/* Drawer com snap points */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        snapPoints={[0.2, 0.6]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <DrawerContent className="border-t-4 border-primary/20">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
              {isExpanded ? (
                <>
                  <span className="text-2xl">📱</span>
                  <span>Instale o Bora no seu celular</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📱</span>
                  <span>Instale o Bora</span>
                </>
              )}
            </DrawerTitle>
            {isExpanded && (
              <DrawerDescription className="text-base">
                Acesso rápido, funciona offline e muito mais!
              </DrawerDescription>
            )}
          </DrawerHeader>

          {/* Conteúdo só aparece quando expandido */}
          {isExpanded && (
            <div className="px-4 pb-6 space-y-6">
              {/* Video Tutorial - MP4 autoplay loop */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/10">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto max-h-72 object-contain bg-gradient-to-br from-muted/50 to-muted"
                >
                  <source src="/videos/install-tutorial.mp4" type="video/mp4" />
                  Seu navegador não suporta vídeo.
                </video>
                {/* Play indicator overlay */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Tutorial
                </div>
              </div>

              {/* Instruções iOS */}
              {isIOS && (
                <div className="space-y-3 bg-muted/50 rounded-xl p-4 border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Como instalar
                  </h3>
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
              )}

              {/* Botão de instalação Android */}
              {isInstallable && !isIOS && (
                <DrawerFooter className="px-0 pt-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Instalando...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-5 h-5" />
                          Instalar Agora
                        </>
                      )}
                    </span>
                  </Button>
                </DrawerFooter>
              )}
            </div>
          )}

          {/* Estado minimizado - hint para expandir */}
          {!isExpanded && (
            <div className="px-4 pb-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <ChevronRight className="w-4 h-4 rotate-90 animate-bounce" />
                <span>Arraste para cima para ver o tutorial</span>
                <ChevronRight className="w-4 h-4 rotate-90 animate-bounce" />
              </div>
              <p className="text-xs text-muted-foreground/70">
                Acesso rápido • Funciona offline • Notificações
              </p>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

interface IOSStepProps {
  step: number;
  icon: React.ReactNode;
  text: string;
}

function IOSStep({ step, icon, text }: IOSStepProps) {
  return (
    <div className="flex items-center gap-3 group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md group-hover:shadow-lg transition-shadow">
        {step}
      </div>
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground border border-border/50 group-hover:border-primary/30 transition-colors">
        {icon}
      </div>
      <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{text}</span>
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
