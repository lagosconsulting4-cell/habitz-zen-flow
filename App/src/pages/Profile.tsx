import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Bell,
  LogOut,
  User,
  Mail,
  Shield,
  Pencil,
  Check,
  X,
  Loader2,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  Vibrate,
  Gift,
  ChevronRight,
  XCircle,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { sounds } from "@/lib/sounds";
import { usePremium } from "@/hooks/usePremium";
import { useProfileInsights } from "@/hooks/useProfileInsights";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useTheme } from "@/hooks/useTheme";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import { bonusSections } from "@/pages/Bonus";
import { bonusFlags } from "@/config/bonusFlags";
import { NotificationToggle } from "@/components/pwa/NotificationPermissionDialog";
import { AvatarShopModal } from "@/components/gamification/AvatarShopModal";
import { AchievementsGrid } from "@/components/gamification/AchievementsGrid";
import { GemCounter } from "@/components/gamification/GemCounter";
import { StreakFreezeCard } from "@/components/gamification/StreakFreezeCard";
import { getAvatarIcon } from "@/components/gamification/AvatarIcons";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Habitz");
  const [email, setEmail] = useState("usuario@habitz.app");
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [avatarShopOpen, setAvatarShopOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { isPremium, premiumSince } = usePremium(userId ?? undefined);
  const { insights, loading: insightsLoading } = useProfileInsights(userId ?? undefined);
  const { prefs, setPreferences } = useAppPreferences();
  const { theme, setTheme } = useTheme();
  const { equippedAvatar, userAchievements, achievementsCatalog, gemsBalance, availableFreezes } = useGamification(userId ?? undefined);

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
        .select("display_name, is_admin")
        .eq("user_id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }
      if (profile?.is_admin) {
        setIsAdmin(profile.is_admin);
      }
    };

    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/app";
  };

  const handleStartEdit = () => {
    setEditedName(displayName);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!userId || !editedName.trim()) return;

    const trimmedName = editedName.trim();
    if (trimmedName.length < 2) {
      toast.error("Nome deve ter ao menos 2 caracteres");
      return;
    }

    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: trimmedName })
        .eq("user_id", userId);

      if (error) throw error;

      setDisplayName(trimmedName);
      setIsEditingName(false);
      toast.success("Nome atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar nome:", error);
      toast.error("Erro ao salvar nome. Tente novamente.");
    } finally {
      setIsSavingName(false);
    }
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
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pb-6 max-w-2xl"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="text-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-primary/30">
              <User className="w-10 h-10 text-primary" />
            </div>
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 font-semibold">
              {isPremium ? "Premium vitalício" : "Conta aguardando ativação"}
            </Badge>
          </div>
          {isAdmin && (
            <Button
              onClick={() => navigate("/admin")}
              className="mb-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg font-semibold"
            >
              <Shield className="w-4 h-4 mr-2" />
              Painel de Admin
            </Button>
          )}
          {isEditingName ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="max-w-[200px] bg-secondary border-border text-foreground text-center"
                placeholder="Seu nome"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleSaveName}
                disabled={isSavingName}
              >
                {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                onClick={handleCancelEdit}
                disabled={isSavingName}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">{displayName}</h1>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={handleStartEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {email}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
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
                <Card className="rounded-2xl bg-card border border-border p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.09 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-primary/30 shadow-md">
                  {(() => {
                    const IconComponent = equippedAvatar ? getAvatarIcon(equippedAvatar.id as any) : null;
                    if (!IconComponent) {
                      return <span className="text-2xl">👤</span>;
                    }
                    return <IconComponent width={40} height={40} />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{equippedAvatar?.name || "Sorriso Básico"}</h3>
                  {equippedAvatar && (
                    <Badge variant="secondary" className="mt-2">
                      {equippedAvatar.tier}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setAvatarShopOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold whitespace-nowrap"
              >
                Mudar Avatar
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Gems and Freezes Recursos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Recursos</h2>
            <div className="space-y-3">
              {/* Gems Display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Gems</p>
                    <p className="text-2xl font-bold text-foreground">{gemsBalance.toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAvatarShopOpen(true)}
                  className="text-purple-600 hover:bg-purple-500/20"
                >
                  Loja <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Freezes Display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Streak Freezes</p>
                    <p className="text-2xl font-bold text-foreground">{availableFreezes}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAvatarShopOpen(true)}
                  className="text-blue-600 hover:bg-blue-500/20"
                >
                  Comprar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bonus Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">Conteúdo Bônus</h2>
            </div>
            <div className="space-y-2">
              {bonusSections
                .filter((section) => bonusFlags[section.id as keyof typeof bonusFlags] !== false)
                .map((section) => (
                  <Link
                    key={section.id}
                    to={section.path}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
            </div>
          </Card>
        </motion.div>

        {false && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="rounded-2xl bg-card border-2 border-primary/30 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground flex items-center gap-2">
                  Conta vitalícia ativa
                </p>
                <p className="text-sm text-muted-foreground">
                  Todos os módulos liberados e atualizações garantidas.
                </p>
              </div>
              <Badge className={isPremium ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground font-semibold"}>
                {isPremium ? "Premium" : "Pendente"}
              </Badge>
            </div>
            {isPremium && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => navigate("/cancel-subscription")}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            )}
          </Card>
        </motion.div>}

        {/* Affiliate Program Section */}
        {false && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
                Programa de Afiliados
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Indique amigos e ganhe recompensas. Compartilhe o Habitz e construa juntos.
            </p>
            <a
              href="https://app.kirvano.com/affiliate/c891e35f-e7f1-4e3a-a719-5346f0af8710"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Acessar Programa de Afiliados
              </Button>
            </a>
          </Card>
        </motion.div>}

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.21 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">Conquistas</h2>
                <p className="text-sm text-muted-foreground">
                  {userAchievements.length} / {achievementsCatalog.length} desbloqueadas
                </p>
              </div>
            </div>
            <AchievementsGrid userId={userId ?? undefined} />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Aparencia</h2>

            <div className="space-y-4">
              {/* Theme Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Tema</p>
                    <p className="text-sm text-muted-foreground">
                      Escolha o tema do aplicativo
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${theme === "light" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    onClick={() => setTheme("light")}
                    title="Tema claro"
                  >
                    <Sun className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${theme === "dark" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    onClick={() => setTheme("dark")}
                    title="Tema escuro"
                  >
                    <Moon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Grid Order */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary font-semibold">Grid</Badge>
                  <div>
                    <p className="font-semibold text-foreground">Ordenacao</p>
                    <p className="text-sm text-muted-foreground">
                      Pendentes primeiro ou por streak
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={prefs.gridOrder === "pending_first" ? "default" : "outline"}
                    className={prefs.gridOrder === "pending_first" ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" : "bg-secondary border-border hover:bg-muted"}
                    onClick={() => setPreferences({ gridOrder: "pending_first" })}
                  >
                    Pendentes
                  </Button>
                  <Button
                    size="sm"
                    variant={prefs.gridOrder === "streak" ? "default" : "outline"}
                    className={prefs.gridOrder === "streak" ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" : "bg-secondary border-border hover:bg-muted"}
                    onClick={() => setPreferences({ gridOrder: "streak" })}
                  >
                    Streak
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sound & Feedback Settings */}
        {false && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.27 }}
          className="mt-4"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Sons e Feedback</h2>

            <div className="space-y-5">
              {/* Sound Toggle + Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {prefs.soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">Sons</p>
                      <p className="text-sm text-muted-foreground">
                        Efeitos sonoros ao completar habitos
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.soundEnabled}
                    onCheckedChange={(checked) => setPreferences({ soundEnabled: checked })}
                  />
                </div>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Vibrate className={`w-5 h-5 ${prefs.hapticEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-semibold text-foreground">Vibracao</p>
                    <p className="text-sm text-muted-foreground">
                      Feedback tatil ao interagir
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs.hapticEnabled}
                  onCheckedChange={(checked) => {
                    setPreferences({ hapticEnabled: checked });
                    if (checked && "vibrate" in navigator) {
                      navigator.vibrate(15);
                    }
                  }}
                />
              </div>

              {/* Celebrations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-5 h-5 ${prefs.celebrationsEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-semibold text-foreground">Celebracoes</p>
                    <p className="text-sm text-muted-foreground">
                      Efeitos visuais ao completar
                    </p>
                  </div>
                </div>
                <Switch
                  checked={prefs.celebrationsEnabled}
                  onCheckedChange={(checked) => setPreferences({ celebrationsEnabled: checked })}
                />
              </div>
            </div>
          </Card>
        </motion.div>}

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.32 }}
          className="mt-4"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Notificacoes</h2>

            <div className="space-y-4">
              {/* Push Notifications Toggle */}
              <NotificationToggle />
            </div>
          </Card>
        </motion.div>

        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.37 }}
            className="mt-6"
          >
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 p-4 border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors rounded-2xl"
              onClick={() => navigate("/cancel-subscription")}
            >
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Cancelar Assinatura</span>
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: isPremium ? 0.42 : 0.37 }}
          className="mt-4"
        >
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-3 p-4 hover:bg-muted transition-colors rounded-2xl text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sair da conta</span>
          </Button>
        </motion.div>

        {/* Avatar Shop Modal */}
        <AvatarShopModal
          isOpen={avatarShopOpen}
          onClose={() => setAvatarShopOpen(false)}
          userId={userId ?? undefined}
        />
      </motion.div>
    </div>
  );
};

export default Profile;
