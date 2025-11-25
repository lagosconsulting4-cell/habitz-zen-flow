import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
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
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useTheme } from "@/hooks/useTheme";

const Profile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Habitz");
  const [email, setEmail] = useState("usuario@habitz.app");
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);

  const { isPremium, premiumSince } = usePremium(userId ?? undefined);
  const { insights, loading: insightsLoading } = useProfileInsights(userId ?? undefined);
  const { prefs, setPreferences } = useAppPreferences();
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-[#000000] pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-lime-400/30">
              <User className="w-10 h-10 text-lime-400" />
            </div>
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-lime-400 text-black border-0 font-semibold">
              {isPremium ? "Premium vitalício" : "Conta aguardando ativação"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-white mb-2">{displayName}</h1>
          <p className="text-white/60 flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {email}
          </p>
          <p className="text-xs text-white/40 mt-2">
            Acesso liberado desde {accessSinceLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const value = insightsLoading
              ? "--"
              : `${numberFormatter.format(stat.value)}${stat.suffix ?? ""}`;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.highlight ? "text-lime-400" : "text-white"}`}>
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="rounded-2xl bg-white/5 border-2 border-lime-400/30 p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-400/10 rounded-lg">
                <Shield className="w-5 h-5 text-lime-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white flex items-center gap-2">
                  Conta vitalícia ativa
                </p>
                <p className="text-sm text-white/60">
                  Todos os módulos liberados e atualizações garantidas.
                </p>
              </div>
              <Badge className={isPremium ? "bg-lime-400 text-black font-semibold" : "bg-white/10 text-white/60 font-semibold"}>
                {isPremium ? "Premium" : "Pendente"}
              </Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-white mb-4">Configurações</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-lime-400" />
                  <div>
                    <p className="font-semibold text-white">Notificações</p>
                    <p className="text-sm text-white/60">
                      Lembretes dos seus hábitos (on/off global)
                    </p>
                  </div>
                </div>
                <Switch checked={prefs.notificationsEnabled} onCheckedChange={(checked) => setPreferences({ notificationsEnabled: checked })} />
              </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="font-semibold text-white">Tema</p>
                  <p className="text-sm text-white/60">
                    Claro, Escuro ou Sistema
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={theme === "light" ? "default" : "outline"}
                  className={theme === "light" ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                  onClick={() => setTheme("light")}
                >
                  Claro
                </Button>
                <Button
                  size="sm"
                  variant={theme === "dark" ? "default" : "outline"}
                  className={theme === "dark" ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                  onClick={() => setTheme("dark")}
                >
                  Escuro
                </Button>
                <Button
                  size="sm"
                  variant={theme === "system" ? "default" : "outline"}
                  className={theme === "system" ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                  onClick={() => setTheme("system")}
                >
                  Sistema
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-lime-400/10 text-lime-400 font-semibold">Grid</Badge>
                <div>
                  <p className="font-semibold text-white">Ordenação do dia</p>
                  <p className="text-sm text-white/60">
                    Pendentes primeiro ou por streak
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={prefs.gridOrder === "pending_first" ? "default" : "outline"}
                  className={prefs.gridOrder === "pending_first" ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                  onClick={() => setPreferences({ gridOrder: "pending_first" })}
                >
                  Pendentes
                </Button>
                <Button
                  size="sm"
                  variant={prefs.gridOrder === "streak" ? "default" : "outline"}
                  className={prefs.gridOrder === "streak" ? "bg-lime-400 text-black hover:bg-lime-500 font-semibold" : "bg-white/5 border-white/10 hover:bg-white/10"}
                  onClick={() => setPreferences({ gridOrder: "streak" })}
                >
                  Streak
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-lime-400/10 text-lime-400 font-semibold">Som</Badge>
                <div>
                  <p className="font-semibold text-white">Som padrão</p>
                  <p className="text-sm text-white/60">
                    Escolha o som base para lembretes
                  </p>
                </div>
              </div>
              <select
                className="rounded-md border px-2 py-1 text-sm bg-white/5 border-white/10 text-white"
                value={prefs.defaultSound}
                onChange={(e) => setPreferences({ defaultSound: e.target.value as any })}
              >
                <option value="default">Padrão</option>
                <option value="soft">Suave</option>
                <option value="bright">Vibrante</option>
              </select>
            </div>
          </div>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="rounded-2xl bg-white/5 border border-white/10">
            <div className="divide-y divide-white/10">
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-t-xl">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-lime-400" />
                  <span className="font-semibold text-white">Preferências</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </button>

              <button
                className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-colors rounded-b-xl text-red-500"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Sair da conta</span>
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default Profile;
