import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  LogOut,
  User,
  Mail,
  Shield,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { useProfileInsights } from "@/hooks/useProfileInsights";

const Profile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Habitz");
  const [email, setEmail] = useState("usuario@habitz.app");
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);

  const { isPremium, premiumSince } = usePremium(userId ?? undefined);
  const { insights, loading: insightsLoading } = useProfileInsights(userId ?? undefined);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("pt-BR"), []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        return;
      }

      setUserId(user.id);
      setEmail((prev) => user.email ?? prev);
      setAccountCreatedAt(user.created_at ?? null);

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

  const stats = [
    { label: "Hábitos ativos", value: insights.activeHabits, highlight: true },
    { label: "Dias usando", value: insights.daysUsing },
    { label: "Consistência", value: insights.consistency, suffix: "%" },
  ];

  const accessStart = insights.sinceDate ?? premiumSince ?? accountCreatedAt;
  const accessSinceLabel = accessStart
    ? new Date(accessStart).toLocaleDateString("pt-BR")
    : "agora";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
              <User className="w-10 h-10 text-white" />
            </div>
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-primary text-white border-0">
              {isPremium ? "Premium vitalício" : "Conta aguardando ativação"}
            </Badge>
          </div>
          <h1 className="text-2xl font-medium mb-2">{displayName}</h1>
          <p className="text-muted-foreground font-light flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {email}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Acesso liberado desde {accessSinceLabel}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          {stats.map((stat) => {
            const value = insightsLoading
              ? "--"
              : `${numberFormatter.format(stat.value)}${stat.suffix ?? ""}`;

            return (
              <Card key={stat.label} className="glass-card p-4 text-center">
                <p className={`text-2xl font-medium ${stat.highlight ? "gradient-text" : ""}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground font-light">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        <Card className="glass-card p-6 mb-8 border-2 border-primary/20 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium flex items-center gap-2">
                Conta vitalícia ativa
              </p>
              <p className="text-sm text-muted-foreground font-light">
                Todos os módulos liberados e atualizações garantidas.
              </p>
            </div>
            <Badge variant="outline">{isPremium ? "Premium" : "Pendente"}</Badge>
          </div>
        </Card>

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

        <Card className="glass-card animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="divide-y divide-border">
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Preferências</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors rounded-b-xl text-destructive"
              onClick={handleSignOut}
            >
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
