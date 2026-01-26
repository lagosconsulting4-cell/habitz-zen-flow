import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Check, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, type Avatar, type AvatarTier } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";
import { GemCounter } from "./GemCounter";

interface AvatarShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const TIER_CONFIG: Record<AvatarTier, { label: string; color: string; bgColor: string; borderColor: string }> = {
  common: {
    label: "Comum",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/30",
  },
  rare: {
    label: "Raro",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
  epic: {
    label: "Épico",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  legendary: {
    label: "Lendário",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
  },
};

export const AvatarShopModal = ({ isOpen, onClose, userId: propUserId }: AvatarShopModalProps) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const [selectedTab, setSelectedTab] = useState<"all" | "unlocked" | "locked">("all");

  const {
    avatarsCatalog,
    userAvatars,
    equippedAvatar,
    gemsBalance,
    progress,
    isAvatarUnlocked,
    canPurchaseAvatar,
    canUnlockAvatarByLevel,
    purchaseAvatar,
    isPurchasingAvatar,
    equipAvatar,
    isEquippingAvatar,
  } = useGamification(userId);

  const handlePurchase = async (avatarId: string) => {
    try {
      await purchaseAvatar({ avatarId });
    } catch (error: any) {
      console.error("Failed to purchase avatar:", error);
    }
  };

  const handleEquip = async (avatarId: string) => {
    try {
      await equipAvatar({ avatarId });
    } catch (error: any) {
      console.error("Failed to equip avatar:", error);
    }
  };

  const handleUnlockByLevel = async (avatar: Avatar) => {
    if (!canUnlockAvatarByLevel(avatar.id)) return;

    try {
      // Unlock without payment - just unlock since level requirement is met
      await equipAvatar({ avatarId: avatar.id });
    } catch (error: any) {
      console.error("Failed to unlock avatar by level:", error);
    }
  };

  const filteredAvatars = avatarsCatalog.filter((avatar) => {
    const unlocked = isAvatarUnlocked(avatar.id);
    if (selectedTab === "unlocked") return unlocked;
    if (selectedTab === "locked") return !unlocked;
    return true;
  });

  // Group avatars by tier
  const groupedAvatars = filteredAvatars.reduce((acc, avatar) => {
    if (!acc[avatar.tier]) acc[avatar.tier] = [];
    acc[avatar.tier].push(avatar);
    return acc;
  }, {} as Record<AvatarTier, Avatar[]>);

  const tierOrder: AvatarTier[] = ["common", "rare", "epic", "legendary"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Loja de Avatares</h2>
                <p className="text-sm text-muted-foreground">
                  {userAvatars.length} / {avatarsCatalog.length} desbloqueados
                </p>
              </div>
              <div className="flex items-center gap-3">
                <GemCounter userId={userId} size="md" />
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {(["all", "unlocked", "locked"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                    selectedTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {tab === "all" ? "Todos" : tab === "unlocked" ? "Desbloqueados" : "Bloqueados"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: "calc(80vh - 140px)" }}>
            {tierOrder.map((tier) => {
              const avatars = groupedAvatars[tier];
              if (!avatars || avatars.length === 0) return null;

              const tierConfig = TIER_CONFIG[tier];

              return (
                <div key={tier}>
                  {/* Tier Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className={cn("w-4 h-4", tierConfig.color)} />
                    <h3 className={cn("text-sm font-semibold uppercase tracking-wider", tierConfig.color)}>
                      {tierConfig.label}
                    </h3>
                    <div className={cn("flex-1 h-px", tierConfig.bgColor)} />
                  </div>

                  {/* Avatar Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {avatars.map((avatar) => {
                      const unlocked = isAvatarUnlocked(avatar.id);
                      const equipped = equippedAvatar?.id === avatar.id;
                      const canBuy = canPurchaseAvatar(avatar.id);
                      const canUnlockByLevel = canUnlockAvatarByLevel(avatar.id);

                      return (
                        <motion.div
                          key={avatar.id}
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            "relative rounded-xl border-2 p-3 transition-all",
                            equipped
                              ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                              : tierConfig.borderColor,
                            !unlocked && "opacity-70"
                          )}
                        >
                          {/* Tier Badge */}
                          <div
                            className={cn(
                              "absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                              tierConfig.bgColor,
                              tierConfig.color
                            )}
                          >
                            {tierConfig.label[0]}
                          </div>

                          {/* Avatar Emoji */}
                          <div className="text-4xl text-center mb-2">{avatar.emoji}</div>

                          {/* Name */}
                          <p className="text-xs font-medium text-center truncate">{avatar.name}</p>

                          {/* Status / Actions */}
                          <div className="mt-2 space-y-1">
                            {equipped && (
                              <div className="flex items-center justify-center gap-1 text-xs text-primary font-medium">
                                <Check className="w-3 h-3" />
                                Equipado
                              </div>
                            )}

                            {!unlocked && avatar.gem_cost && (
                              <button
                                onClick={() => handlePurchase(avatar.id)}
                                disabled={!canBuy || isPurchasingAvatar}
                                className={cn(
                                  "w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                                  canBuy
                                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                              >
                                <Sparkles className="w-3 h-3" />
                                {avatar.gem_cost}
                              </button>
                            )}

                            {!unlocked && avatar.unlock_level && !avatar.gem_cost && (
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                Nível {avatar.unlock_level}
                              </div>
                            )}

                            {!unlocked && avatar.unlock_level && canUnlockByLevel && (
                              <button
                                onClick={() => handleUnlockByLevel(avatar)}
                                className="w-full py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-all"
                              >
                                Desbloquear
                              </button>
                            )}

                            {unlocked && !equipped && (
                              <button
                                onClick={() => handleEquip(avatar.id)}
                                disabled={isEquippingAvatar}
                                className="w-full py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 transition-all"
                              >
                                Equipar
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredAvatars.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum avatar encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AvatarShopModal;
