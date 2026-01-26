import { Share2, Copy, Check, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/hooks/useGamification";

interface ShareAchievementProps {
  achievement: Achievement;
  userStats?: {
    level: number;
    streak: number;
    gems: number;
  };
  size?: "sm" | "md";
}

export function ShareAchievement({
  achievement,
  userStats,
  size = "md",
}: ShareAchievementProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🏆 Desbloqueei a conquista "${achievement.name}" no Habitz!

"${achievement.description}"

Meu progresso:
⭐ Nível: ${userStats?.level || "?"}
🔥 Sequência: ${userStats?.streak || 0} dias
💎 Gems: ${userStats?.gems || 0}

Junte-se a mim em: https://habitz.app`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTwitter = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=https://habitz.app`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(
      `https://wa.me/?text=${encodedText}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      // Fallback to copy if native share not available
      handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: "Nova Conquista no Habitz!",
        text: shareText,
        url: "https://habitz.app",
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  };

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-1",
    md: "text-sm gap-2 px-3 py-2",
  };

  return (
    <div className={cn("flex flex-wrap", sizeClasses[size])}>
      <Button
        size={size === "sm" ? "sm" : "default"}
        variant="outline"
        onClick={handleCopy}
        className="text-foreground hover:bg-secondary"
        title="Copiar para clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 mr-1" />
            Copiar
          </>
        )}
      </Button>

      <Button
        size={size === "sm" ? "sm" : "default"}
        variant="outline"
        onClick={handleTwitter}
        className="text-foreground hover:bg-blue-500/10 hover:text-blue-500 border-blue-500/20"
        title="Compartilhar no Twitter/X"
      >
        <svg
          className="w-3.5 h-3.5 mr-1"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.694-5.848 6.694H2.422l7.723-8.835L1.254 2.25h6.554l4.882 6.467 5.633-6.467zM5.892 19.75h1.54L18.073 4.377h-1.54L5.892 19.75z" />
        </svg>
        X
      </Button>

      <Button
        size={size === "sm" ? "sm" : "default"}
        variant="outline"
        onClick={handleWhatsApp}
        className="text-foreground hover:bg-green-500/10 hover:text-green-500 border-green-500/20"
        title="Compartilhar no WhatsApp"
      >
        <svg
          className="w-3.5 h-3.5 mr-1"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.397 1.913 3.596 6.4 5.12 10.115 3.395 3.667-1.719 5.513-5.736 4.046-9.34-1.995-4.757-7.093-7.5-12.048-5.833l-.142.087z" />
        </svg>
        WhatsApp
      </Button>

      {navigator.share && (
        <Button
          size={size === "sm" ? "sm" : "default"}
          variant="outline"
          onClick={handleNativeShare}
          className="text-foreground hover:bg-primary/10 hover:text-primary border-primary/20"
          title="Mais opções de compartilhamento"
        >
          <Share2 className="w-3.5 h-3.5 mr-1" />
          Compartilhar
        </Button>
      )}
    </div>
  );
}

export default ShareAchievement;
