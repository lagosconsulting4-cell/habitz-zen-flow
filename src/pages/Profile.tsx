import { Settings, Bell, Palette, Crown, LogOut, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";

const Profile = () => {
  const isPremium = false; // This would come from user subscription status
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
              <User className="w-10 h-10 text-white" />
            </div>
            {isPremium && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-medium mb-2">Jovem Desenvolvedor</h1>
          <p className="text-muted-foreground font-light flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            jovem@habitz.app
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="glass-card p-4 text-center hover:shadow-medium transition-all duration-300">
            <p className="text-2xl font-medium gradient-text">3</p>
            <p className="text-xs text-muted-foreground font-light">Hábitos ativos</p>
            {!isPremium && (
              <p className="text-xs text-primary mt-1">de 3 grátis</p>
            )}
          </Card>
          <Card className="glass-card p-4 text-center hover:shadow-medium transition-all duration-300">
            <p className="text-2xl font-medium">12</p>
            <p className="text-xs text-muted-foreground font-light">Dias usando</p>
          </Card>
          <Card className="glass-card p-4 text-center hover:shadow-medium transition-all duration-300">
            <p className="text-2xl font-medium">85%</p>
            <p className="text-xs text-muted-foreground font-light">Consistência</p>
          </Card>
        </div>

        {/* Premium Banner or Premium Status */}
        {!isPremium ? (
          <Card className="glass-card p-6 mb-8 bg-gradient-primary text-white animate-slide-up hover:shadow-elegant transition-all duration-300" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">Upgrade para Premium</h3>
                <p className="text-white/80 font-light text-sm">
                  Hábitos ilimitados + temas + relatórios + conteúdos exclusivos
                </p>
                <p className="text-white/90 font-medium text-sm mt-1">
                  R$ 247/ano ou 6x R$ 41,17
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-white/90 rounded-xl font-medium shadow-soft"
              >
                Upgrade
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="glass-card p-4 mb-8 border-2 border-primary/20 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  Habitz Premium Ativo
                </p>
                <p className="text-sm text-muted-foreground font-light">
                  Renovação automática em Jan 2025
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Gerenciar
              </Button>
            </div>
          </Card>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <h2 className="text-lg font-medium mb-4">Configurações</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notificações</p>
                    <p className="text-sm text-muted-foreground font-light">
                      Lembretes dos seus hábitos
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Tema escuro</p>
                    <p className="text-sm text-muted-foreground font-light">
                      Alternar entre claro e escuro
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Account & Support */}
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Editar perfil</span>
                </div>
                <span className="text-muted-foreground">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Configurações avançadas</span>
                </div>
                <span className="text-muted-foreground">→</span>
              </button>

              <button className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors rounded-b-xl text-destructive">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair da conta</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Profile;