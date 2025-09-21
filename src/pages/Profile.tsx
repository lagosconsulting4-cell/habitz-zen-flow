import { Settings, Bell, Palette, Crown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import NavigationBar from "@/components/NavigationBar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-medium mb-2">Jovem Desenvolvedor</h1>
          <p className="text-muted-foreground font-light">jovem@habitz.app</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium">12</p>
            <p className="text-xs text-muted-foreground font-light">Hábitos ativos</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium">47</p>
            <p className="text-xs text-muted-foreground font-light">Dias usando</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium">78%</p>
            <p className="text-xs text-muted-foreground font-light">Consistência</p>
          </Card>
        </div>

        {/* Premium Banner */}
        <Card className="glass-card p-6 mb-8 bg-gradient-primary text-white animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">Upgrade para Pro</h3>
              <p className="text-white/80 font-light text-sm">
                Hábitos ilimitados + recursos exclusivos
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-primary hover:bg-white/90 rounded-xl font-medium"
            >
              Upgrade
            </Button>
          </div>
        </Card>

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

          {/* Menu Items */}
          <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Configurações avançadas</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Editar perfil</span>
              </button>

              <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors rounded-b-xl text-destructive">
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