import { useEffect, useState } from "react";
import { Settings, Bell, Palette, LogOut, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

const Profile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Habitz");
  const [email, setEmail] = useState("usuario@habitz.app");
  const { isPremium, premiumSince } = usePremium(userId ?? undefined);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        return;
      }

      setUserId(user.id);
      setEmail((prev) => user.email ?? prev);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }
    };

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
              <User className="w-10 h-10 text-white" />
            </div>
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white border-0">
              Premium vitalicio
            </Badge>
          </div>
          <h1 className="text-2xl font-medium mb-2">{displayName}</h1>
          <p className="text-muted-foreground font-light flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {email}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Acesso liberado desde {premiumSince ? new Date(premiumSince).toLocaleDateString("pt-BR") : "agora"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium gradient-text">12</p>
            <p className="text-xs text-muted-foreground font-light">Habitos ativos</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium">45</p>
            <p className="text-xs text-muted-foreground font-light">Dias usando</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <p className="text-2xl font-medium">89%</p>
            <p className="text-xs text-muted-foreground font-light">Consistencia</p>
          </Card>
        </div>

        <Card className="glass-card p-6 mb-8 border-2 border-primary/20 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                Conta vitalicia ativa
              </p>
              <p className="text-sm text-muted-foreground font-light">
                Todos os modulos liberados e atualizacoes garantidas.
              </p>
            </div>
            <Badge variant="outline">Premium</Badge>
          </div>
        </Card>

        <Card className="glass-card p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-lg font-medium mb-4">Configuracoes</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notificacoes</p>
                  <p className="text-sm text-muted-foreground font-light">
                    Lembretes dos seus habitos
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

        <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="divide-y divide-border">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Preferencias</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>

            <button className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors rounded-b-xl text-destructive" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair da conta</span>
            </button>
          </div>
        </Card>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Profile;

