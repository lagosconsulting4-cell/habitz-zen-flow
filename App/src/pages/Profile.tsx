import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Clock,
  LogOut,
  Mail,
  Diamond,
  Snowflake,
  Shield,
  Pencil,
  Check,
  X,
  Loader2,
  Sun,
  Moon,
  Gift,
  ChevronRight,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/hooks/useTheme";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import { bonusSections } from "@/pages/Bonus";
import { bonusFlags } from "@/config/bonusFlags";
import { NotificationToggle } from "@/components/pwa/NotificationPermissionDialog";
import { FreezeShopModal } from "@/components/gamification/FreezeShopModal";
import { AvatarDisplay } from "@/components/gamification/AvatarIcons";
import { AvatarCreator } from "@/components/gamification/AvatarCreator";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Habitz");
  const [email, setEmail] = useState("usuario@habitz.app");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [freezeShopOpen, setFreezeShopOpen] = useState(false);
  const [avatarCreatorOpen, setAvatarCreatorOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<{
    end_of_day_enabled?: boolean;
  }>({});

  const { isPremium } = usePremium(userId ?? undefined);
  const { theme, setTheme } = useTheme();
  const { equippedAvatar, gemsBalance, availableFreezes, avatarConfig } = useGamification(userId ?? undefined);

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
        .select("display_name, is_admin")
        .eq("user_id", user.id)
        .single();

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }
      if (profile?.is_admin) {
        setIsAdmin(profile.is_admin);
      }

      // Load notification preferences
      const { data: progress } = await supabase
        .from("user_progress")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      if (progress?.notification_preferences) {
        setNotifPrefs(progress.notification_preferences);
      }
    };

    loadProfile();
  }, []);

  const updateNotifPref = async (key: string, value: boolean | string | Record<string, string | undefined>) => {
    if (!userId) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    const { error } = await supabase
      .from("user_progress")
      .update({ notification_preferences: updated })
      .eq("user_id", userId);
    if (error) {
      toast.error("Erro ao salvar preferencia");
      setNotifPrefs(notifPrefs); // revert
    }
  };

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

  return (
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 pb-6 max-w-2xl"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* ====== 1. Identity Header ====== */}
        <div className="text-center mb-8">
          <div className="relative">
            <button
              onClick={() => setAvatarCreatorOpen(true)}
              className="relative group mx-auto mb-4 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Personalizar avatar"
            >
              <AvatarDisplay
                config={avatarConfig as any}
                size={96}
                className="rounded-full shadow-lg overflow-hidden"
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
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
                aria-label="Confirmar alteracao"
              >
                {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                onClick={handleCancelEdit}
                disabled={isSavingName}
                aria-label="Cancelar edicao"
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
                aria-label="Editar nome"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {email}
          </p>
        </div>

        {/* ====== 2. Recursos ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Recursos</h2>
            <div className="space-y-3">
              {/* Gems Display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Diamond className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Gems</p>
                    <p className="text-2xl font-bold text-foreground">{gemsBalance.toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFreezeShopOpen(true);
                  }}
                  className="text-primary hover:bg-primary/20"
                >
                  Loja <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Freezes Display */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-foreground/5 to-foreground/10 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-foreground/10">
                    <Snowflake className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Streak Freezes</p>
                    <p className="text-2xl font-bold text-foreground">{availableFreezes}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFreezeShopOpen(true);
                  }}
                  className="text-foreground hover:bg-foreground/10"
                >
                  Comprar <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ====== 3. Conteudo Bonus ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">Conteudo Bonus</h2>
            </div>
            <div className="space-y-2">
              {bonusSections
                .filter(
                  (section) =>
                    bonusFlags[section.id as keyof typeof bonusFlags] !== false &&
                    !["plano", "guided"].includes(section.id)
                )
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

        {/* ====== 4. Aparencia ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Aparencia</h2>
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
                  className={`h-11 w-11 p-0 ${theme === "light" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                  onClick={() => setTheme("light")}
                  aria-label="Tema claro"
                  aria-pressed={theme === "light"}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-11 w-11 p-0 ${theme === "dark" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                  onClick={() => setTheme("dark")}
                  aria-label="Tema escuro"
                  aria-pressed={theme === "dark"}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ====== 5. Notificacoes ====== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4"
        >
          <Card className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">Notificacoes</h2>

            <div className="space-y-4">
              {/* Push Notifications Toggle */}
              <NotificationToggle />

              {/* End of Day Reminder */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lembrete Fim do Dia</p>
                    <p className="text-xs text-muted-foreground">Notificar habitos pendentes as 22h</p>
                  </div>
                </div>
                <Switch
                  checked={notifPrefs.end_of_day_enabled !== false}
                  onCheckedChange={(checked) => updateNotifPref("end_of_day_enabled", checked)}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ====== 6. Acoes da Conta ====== */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
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
          transition={{ duration: 0.3, delay: isPremium ? 0.3 : 0.25 }}
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

        {/* Freeze Shop Modal */}
        <FreezeShopModal
          isOpen={freezeShopOpen}
          onClose={() => setFreezeShopOpen(false)}
          userId={userId ?? undefined}
        />

        {/* Avatar Creator */}
        <AvatarCreator
          isOpen={avatarCreatorOpen}
          onClose={() => setAvatarCreatorOpen(false)}
          userId={userId ?? undefined}
        />
      </motion.div>
    </div>
  );
};

export default Profile;
