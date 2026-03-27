import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  LogOut,
  Gem,
  Snowflake,
  Pencil,
  Check,
  X,
  Loader2,
  Sun,
  Moon,
  ChevronRight,
  User,
  Bell,
  Shield,
  Globe,
  HelpCircle,
  BookOpen,
  BarChart3,
  Headphones,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { FreezeShopModal } from "@/components/gamification/FreezeShopModal";
import { AvatarDisplay } from "@/components/gamification/AvatarIcons";
import { AvatarCreator } from "@/components/gamification/AvatarCreator";
import { cn } from "@/lib/utils";

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
    reminder_offset_minutes?: number;
    quiet_hours_start?: string | null;
    quiet_hours_end?: string | null;
  }>({});

  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const { gemsBalance, availableFreezes, avatarConfig, refetchAvatarConfig } = useGamification(userId ?? undefined);

  const handleShopClose = useCallback(() => {
    setFreezeShopOpen(false);
    // Force refetch gems & freezes so Profile shows updated values immediately
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });
      queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });
    }
  }, [userId, queryClient]);
  const { isSubscribed, subscribe, unsubscribe, isLoading: notifLoading } = usePushNotifications();


  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      setUserId(user.id);
      setEmail((prev) => user.email ?? prev);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, is_admin")
        .eq("user_id", user.id)
        .single();

      if (profile?.display_name) setDisplayName(profile.display_name);
      if (profile?.is_admin) setIsAdmin(profile.is_admin);

      const { data: progress } = await supabase
        .from("user_progress")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      if (progress?.notification_preferences) {
        setNotifPrefs(progress.notification_preferences as typeof notifPrefs);
      }
    };
    loadProfile();
  }, []);

  const updateNotifPref = async (key: string, value: boolean | string | number | null) => {
    if (!userId) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    const { error } = await supabase
      .from("user_progress")
      .update({ notification_preferences: updated })
      .eq("user_id", userId);
    if (error) {
      toast.error("Erro ao salvar preferência");
      setNotifPrefs(notifPrefs);
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
      toast.success("Nome atualizado!");
    } catch {
      toast.error("Erro ao salvar nome.");
    } finally {
      setIsSavingName(false);
    }
  };

  // Shared card styles
  const cardStyle = isDark ? {
    background: "linear-gradient(145deg, #1c1c1c 0%, #141414 100%)",
    boxShadow: "0 0 40px rgba(163,230,53,0.03), 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
  } : undefined;
  const cardClass = isDark
    ? "border border-white/[0.08]"
    : "bg-white border border-gray-100 shadow-sm";

  return (
    <div className="min-h-screen bg-background pb-navbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 max-w-xl mx-auto w-full"
        style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* ====== Avatar Header ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center mb-8 pt-4"
        >
          {/* Avatar with green ring */}
          <div className="relative mb-4">
            {/* Outer glow ring */}
            <div
              className="w-32 h-32 rounded-full p-[2px]"
              style={{
                background: "linear-gradient(135deg, #A3E635, #65A30D)",
                boxShadow: isDark
                  ? "0 0 50px rgba(163,230,53,0.35), 0 0 100px rgba(163,230,53,0.15), 0 0 150px rgba(163,230,53,0.06)"
                  : "0 0 40px rgba(163,230,53,0.2), 0 0 80px rgba(163,230,53,0.08)",
              }}
            >
              {/* Dark gap between ring and avatar */}
              <div className={cn("w-full h-full rounded-full p-[6px]", isDark ? "bg-[#0A0A0A]" : "bg-background")}>
                <div className="w-full h-full rounded-full overflow-hidden">
                  <AvatarDisplay config={avatarConfig as Record<string, unknown> | null} size={112} />
                </div>
              </div>
            </div>
            {/* Edit button */}
            <button
              onClick={() => setAvatarCreatorOpen(true)}
              className="absolute bottom-1 right-0 w-11 h-11 rounded-full bg-lime-400 flex items-center justify-center"
              style={{ boxShadow: "0 4px 12px rgba(163,230,53,0.4), 0 0 20px rgba(163,230,53,0.15)" }}
            >
              <Pencil className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Name */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-48 text-center"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <button onClick={handleSaveName} disabled={isSavingName} className="p-1.5 rounded-full bg-lime-400 text-black">
                {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={handleCancelEdit} className="p-1.5 rounded-full bg-white/10 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleStartEdit} className="group">
              <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-foreground")}>
                {displayName}
              </h1>
            </button>
          )}
          <p className={cn("text-sm mt-1", isDark ? "text-white/40" : "text-muted-foreground")}>
            {email}
          </p>
          {isAdmin && (
            <Link to="/admin" className="mt-2 text-[10px] uppercase tracking-widest text-lime-400 font-bold">
              Admin
            </Link>
          )}
        </motion.div>

        {/* ====== Resources ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className={cn("text-base font-bold", isDark ? "text-white" : "text-foreground")}>
              Recursos
            </h2>
            <button
              onClick={() => setFreezeShopOpen(true)}
              className={cn("text-[11px] font-semibold uppercase tracking-wider", isDark ? "text-lime-400" : "text-lime-600")}
            >
              Ver Loja
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Gems */}
            <button
              onClick={() => setFreezeShopOpen(true)}
              className={cn("rounded-2xl p-5 flex flex-col items-center text-center", cardClass)}
              style={cardStyle}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", isDark ? "bg-lime-400/15" : "bg-lime-100")}>
                <Gem className={cn("w-6 h-6", isDark ? "text-lime-300" : "text-lime-600")} />
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", isDark ? "text-white" : "text-foreground")}>
                {(gemsBalance || 0).toLocaleString()}
              </p>
              <p className={cn("text-[9px] uppercase tracking-widest mt-1", isDark ? "text-white/30" : "text-muted-foreground")}>
                Gemas Coletadas
              </p>
            </button>

            {/* Freezes */}
            <button
              onClick={() => setFreezeShopOpen(true)}
              className={cn("rounded-2xl p-5 flex flex-col items-center text-center", cardClass)}
              style={cardStyle}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", isDark ? "bg-sky-400/15" : "bg-sky-100")}>
                <Snowflake className={cn("w-6 h-6", isDark ? "text-sky-300" : "text-sky-600")} />
              </div>
              <p className={cn("text-2xl font-bold tabular-nums", isDark ? "text-white" : "text-foreground")}>
                {String(availableFreezes || 0).padStart(2, "0")}
              </p>
              <p className={cn("text-[9px] uppercase tracking-widest mt-1", isDark ? "text-white/30" : "text-muted-foreground")}>
                Freezes Disponíveis
              </p>
            </button>
          </div>
        </motion.div>

        {/* ====== Bonus Content ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className={cn("text-base font-bold mb-3", isDark ? "text-white" : "text-foreground")}>
            Conteúdo Bônus
          </h2>
          <div className={cn("rounded-2xl overflow-hidden divide-y", cardClass, isDark ? "divide-white/[0.04]" : "divide-gray-100")} style={cardStyle}>
            {[
              { icon: Headphones, label: "Meditações", subtitle: "Sessões de relaxamento", path: "/meditation" },
              { icon: BookOpen, label: "Biblioteca", subtitle: "Guias e artigos diários", path: "/books" },
              { icon: BarChart3, label: "Insights", subtitle: "Dados de correlação", path: "/tips" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn("flex items-center gap-4 px-5 py-4 transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", isDark ? "bg-white/5" : "bg-gray-100")}>
                  <item.icon className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-foreground")}>{item.label}</p>
                  <p className={cn("text-[11px]", isDark ? "text-white/40" : "text-muted-foreground")}>{item.subtitle}</p>
                </div>
                <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ====== Account Settings ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 px-1", isDark ? "text-white/30" : "text-muted-foreground")}>
            Configurações da Conta
          </p>
          <div className={cn("rounded-2xl overflow-hidden divide-y", cardClass, isDark ? "divide-white/[0.04]" : "divide-gray-100")} style={cardStyle}>
            {/* Edit Profile */}
            <button
              onClick={handleStartEdit}
              className={cn("flex items-center gap-4 px-5 py-4 w-full text-left transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                <User className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Editar Perfil</span>
              <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
            </button>

            {/* Notifications */}
            <div className={cn("flex items-center gap-4 px-5 py-4")}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                <Bell className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Notificações</span>
              <Switch
                checked={isSubscribed}
                disabled={notifLoading}
                onCheckedChange={async (checked) => {
                  if (checked) await subscribe();
                  else await unsubscribe();
                }}
                className="data-[state=checked]:bg-lime-400"
              />
            </div>

            {/* Security */}
            <button
              className={cn("flex items-center gap-4 px-5 py-4 w-full text-left transition-colors opacity-50", isDark ? "" : "")}
              disabled
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                <Shield className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Segurança</span>
              <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
            </button>
          </div>
        </motion.div>

        {/* ====== Preferences ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 px-1", isDark ? "text-white/30" : "text-muted-foreground")}>
            Preferências
          </p>
          <div className={cn("rounded-2xl overflow-hidden divide-y", cardClass, isDark ? "divide-white/[0.04]" : "divide-gray-100")} style={cardStyle}>
            {/* Theme */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn("flex items-center gap-4 px-5 py-4 w-full text-left transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                {isDark ? <Moon className="w-5 h-5 text-white/50" /> : <Sun className="w-5 h-5 text-gray-500" />}
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Tema</span>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-lime-400" : "text-lime-600")}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
            </button>

            {/* Language */}
            <div className={cn("flex items-center gap-4 px-5 py-4")}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                <Globe className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Idioma</span>
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", isDark ? "text-white/40" : "text-muted-foreground")}>
                Português
              </span>
            </div>

            {/* Help */}
            <a
              href="https://wa.me/5511993371766?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20app%20Bora"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("flex items-center gap-4 px-5 py-4 w-full text-left transition-colors", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                <HelpCircle className={cn("w-5 h-5", isDark ? "text-white/50" : "text-gray-500")} />
              </div>
              <span className={cn("text-sm font-semibold flex-1", isDark ? "text-white" : "text-foreground")}>Ajuda/Suporte</span>
              <ChevronRight className={cn("w-4 h-4", isDark ? "text-white/20" : "text-gray-300")} />
            </a>
          </div>
        </motion.div>

        {/* ====== Sign Out ====== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={handleSignOut}
            className={cn("flex items-center gap-2 text-sm font-medium transition-colors", isDark ? "text-red-400/70 hover:text-red-400" : "text-red-500/70 hover:text-red-500")}
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </motion.div>
      </motion.div>

      {/* Modals */}
      {userId && (
        <>
          <FreezeShopModal isOpen={freezeShopOpen} onClose={handleShopClose} userId={userId} />
          <AvatarCreator isOpen={avatarCreatorOpen} onClose={() => {
            setAvatarCreatorOpen(false);
            // Force refetch avatar from DB after save
            setTimeout(() => {
              refetchAvatarConfig();
            }, 300);
          }} userId={userId} />
        </>
      )}
    </div>
  );
};

export default Profile;
