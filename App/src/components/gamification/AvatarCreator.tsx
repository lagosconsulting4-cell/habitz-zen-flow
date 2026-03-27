import { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Check, Loader2, Lock, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import {
  type DiceBearAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  AvatarDisplay,
  SKIN_COLORS,
  HAIR_STYLES,
  HAT_STYLES,
  HAIR_COLORS,
  EYE_TYPES,
  EYEBROW_TYPES,
  MOUTH_TYPES,
  FACIAL_HAIR_TYPES,
  CLOTHING_TYPES,
  CLOTHES_COLORS,
  ACCESSORY_TYPES,
  CLOTHING_GRAPHIC_TYPES,
  BG_COLORS,
} from "./AvatarIcons";
import { isUnlocked, getUnlockThreshold } from "@/config/avatarUnlocks";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type TraitKey = keyof DiceBearAvatarConfig;

interface Category {
  id: string;
  label: string;
  traits: TraitKey[];
}

const CATEGORIES: Category[] = [
  { id: "skin",     label: "Rosto",  traits: ["skinColor"] },
  { id: "hair",     label: "Cabelo", traits: ["top", "hairColor"] },
  { id: "eyes",     label: "Olhos",  traits: ["eyes", "eyebrows"] },
  { id: "mouth",    label: "Boca",   traits: ["mouth"] },
  { id: "clothing", label: "Roupa",  traits: ["clothing", "clothesColor"] },
  { id: "extras",   label: "Extras", traits: ["facialHair", "accessories", "backgroundColor"] },
];

const COLOR_TRAITS = new Set<TraitKey>([
  "skinColor", "hairColor", "clothesColor", "backgroundColor",
  "facialHairColor", "accessoriesColor", "hatColor",
]);

const ALLOW_NONE_TRAITS = new Set<TraitKey>(["facialHair", "accessories"]);

const TRAIT_OPTIONS: Partial<Record<TraitKey, string[]>> = {
  skinColor:       SKIN_COLORS,
  top:             [...HAIR_STYLES, ...HAT_STYLES],
  hairColor:       HAIR_COLORS,
  eyes:            EYE_TYPES,
  eyebrows:        EYEBROW_TYPES,
  mouth:           MOUTH_TYPES,
  facialHair:      FACIAL_HAIR_TYPES,
  clothing:        CLOTHING_TYPES,
  clothesColor:    CLOTHES_COLORS,
  clothingGraphic: CLOTHING_GRAPHIC_TYPES,
  accessories:     ACCESSORY_TYPES,
  backgroundColor: BG_COLORS,
};

const TRAIT_LABELS: Partial<Record<TraitKey, string>> = {
  skinColor:       "Tom de Pele",
  top:             "Cabelo & Chapéu",
  hairColor:       "Cor do Cabelo",
  eyes:            "Olhos",
  eyebrows:        "Sobrancelhas",
  mouth:           "Boca",
  facialHair:      "Barba",
  clothing:        "Roupa",
  clothesColor:    "Cor da Roupa",
  clothingGraphic: "Estampa",
  accessories:     "Acessórios",
  backgroundColor: "Cor de Fundo",
};

const OPTION_LABELS: Record<string, string> = {
  bob: "Bob", bun: "Coque", curly: "Cacheado", curvy: "Ondulado",
  dreads: "Dreads", dreads01: "Dreads 2", dreads02: "Dreads 3",
  frida: "Frida", fro: "Afro", froBand: "Afro Faixa", frizzle: "Frizz",
  longButNotTooLong: "Médio", miaWallace: "Liso Longo",
  shavedSides: "Raspado", shaggy: "Desgrenhado", shaggyMullet: "Mullet",
  shortCurly: "Curto Cacheado", shortFlat: "Curto Liso", shortRound: "Curto Redondo",
  shortWaved: "Curto Ondulado", sides: "Lateral", straight01: "Liso 1",
  straight02: "Liso 2", straightAndStrand: "Liso Mecha",
  theCaesar: "Caesar", theCaesarAndSidePart: "Caesar Risco", bigHair: "Volume",
  hat: "Boné", hijab: "Hijab", turban: "Turbante",
  winterHat1: "Touca 1", winterHat02: "Touca 2", winterHat03: "Touca 3", winterHat04: "Touca 4",
  default: "Normal", happy: "Feliz", closed: "Fechado", cry: "Chorando",
  eyeRoll: "Revirando", hearts: "Corações", side: "Lateral",
  squint: "Apertado", surprised: "Surpreso", wink: "Piscando",
  winkWacky: "Piscar Maluco", xDizzy: "Tonto",
  defaultNatural: "Natural", angryNatural: "Bravo", flatNatural: "Reto",
  frownNatural: "Franzido", raisedExcitedNatural: "Empolgado",
  sadConcernedNatural: "Triste", unibrowNatural: "Monocelha",
  upDownNatural: "Assimétrico", angry: "Bravo Fino",
  raisedExcited: "Empolgado Fino", sadConcerned: "Triste Fino", upDown: "Assimétrico Fino",
  smile: "Sorriso", twinkle: "Brilhante", tongue: "Língua",
  concerned: "Preocupado", disbelief: "Incrédulo", eating: "Comendo",
  grimace: "Careta", sad: "Triste", screamOpen: "Gritando", serious: "Sério", vomit: "Enjoado",
  beardLight: "Barba Leve", beardMedium: "Barba Média", beardMajestic: "Barbona",
  moustacheFancy: "Bigode Fino", moustacheMagnum: "Bigodão",
  blazerAndShirt: "Blazer", blazerAndSweater: "Blazer + Suéter",
  collarAndSweater: "Gola + Suéter", graphicShirt: "Camiseta Estampa",
  hoodie: "Moletom", overall: "Macacão", shirtCrewNeck: "Camiseta",
  shirtScoopNeck: "Regata", shirtVNeck: "Gola V",
  bat: "Morcego", bear: "Urso", cumbia: "Cumbia", deer: "Cervo", diamond: "Diamante",
  hola: "Hola", pizza: "Pizza", resist: "Resist", skull: "Caveira", skullOutline: "Caveira 2",
  kurt: "Kurt", prescription01: "Óculos 1", prescription02: "Óculos 2",
  round: "Redondo", sunglasses: "Óculos de Sol", wayfarers: "Wayfarer", eyepatch: "Tapa-olho",
};

// ============================================================================
// COLOR NAME MAP (for "SELECIONADO: X" label)
// ============================================================================

const COLOR_NAMES: Record<string, string> = {
  "614335": "Escuro", "d08b5b": "Médio", "ae5d29": "Bronze",
  "edb98a": "Claro", "ffdbb4": "Pálido", "fd9841": "Dourado", "f8d25c": "Amarelo",
  "c68642": "Canela", "8d5524": "Mogno", "e0ac69": "Mel", "f1c27d": "Areia", "ffdbac": "Pêssego",
  "2c1b18": "Preto", "4a312c": "Castanho Escuro", "724133": "Marrom",
  "a55728": "Ruivo", "b58143": "Castanho", "d6b370": "Loiro Escuro",
  "e8e1e1": "Platina", "ecdcbf": "Loiro", "c93305": "Vermelho", "f59797": "Rosa",
};

// ============================================================================
// COLOR PALETTE
// ============================================================================

function ColorPalette({
  label,
  colors,
  selected,
  onSelect,
  isDark,
}: {
  label: string;
  colors: string[];
  selected: string | undefined;
  onSelect: (color: string) => void;
  isDark: boolean;
}) {
  const selectedName = selected ? (COLOR_NAMES[selected] || "") : "";

  return (
    <div className="px-5">
      {/* Title outside card */}
      {label && (
        <div className="flex items-center justify-between mb-3">
          <p className={cn("text-base font-bold", isDark ? "text-white" : "text-foreground")}>{label}</p>
          {selectedName && (
            <p className={cn("text-[10px] uppercase tracking-widest", isDark ? "text-white/40" : "text-muted-foreground")}>
              Selecionado: {selectedName}
            </p>
          )}
        </div>
      )}
      {/* Card container */}
      <div
        className={cn("rounded-2xl p-5", isDark ? "border border-white/[0.04]" : "bg-gray-50/80 border border-gray-100")}
        style={isDark ? {
          background: "rgba(30, 30, 42, 0.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        } : undefined}
      >
        <div className="grid grid-cols-4 gap-4 place-items-center">
          {colors.map((color) => {
            const isSelected = selected === color;
            return (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="relative w-14 h-14 rounded-full transition-all focus:outline-none"
                style={{
                  backgroundColor: `#${color}`,
                  boxShadow: isSelected
                    ? `0 0 0 3px ${isDark ? "#181820" : "#f9fafb"}, 0 0 0 5px #A3E635`
                    : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
                aria-label={`Cor ${COLOR_NAMES[color] || color}`}
              >
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center border-2" style={{ borderColor: isDark ? "#181820" : "#f9fafb" }}>
                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHAPE ITEM CARD
// ============================================================================

interface ShapeItemCardProps {
  value: string;
  itemConfig: DiceBearAvatarConfig;
  selected: boolean;
  locked: boolean;
  requiredStreak: number;
  onClick: () => void;
  isDark: boolean;
}

function ShapeItemCard({ value, itemConfig, selected, locked, requiredStreak, onClick, isDark }: ShapeItemCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[90px] h-[90px] flex items-center justify-center rounded-2xl transition-all focus:outline-none",
        selected
          ? isDark ? "border-2 border-lime-400/60" : "border-2 border-lime-500 shadow-md"
          : locked
            ? isDark ? "border border-white/[0.04] opacity-40" : "border border-gray-100 opacity-40"
            : isDark ? "border border-white/[0.06] active:scale-95" : "border border-gray-200 active:scale-95",
      )}
      style={isDark ? {
        backgroundColor: selected ? "#1a2a1a" : "#1a1a1a",
        boxShadow: selected ? "0 0 20px rgba(163,230,53,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
      } : {
        backgroundColor: selected ? "#f0fdf4" : "#f9fafb",
      }}
    >
      <div className={cn("w-16 h-16 rounded-xl overflow-hidden", locked && "grayscale")}>
        <AvatarDisplay config={itemConfig} size={64} />
      </div>

      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl gap-0.5">
          <Lock className={cn("w-4 h-4", isDark ? "text-white/30" : "text-gray-400")} />
          <span className={cn("text-[8px] font-bold", isDark ? "text-white/30" : "text-gray-400")}>{requiredStreak}d</span>
        </div>
      )}

      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-black" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ============================================================================
// TRAIT SECTION
// ============================================================================

interface TraitSectionProps {
  traitKey: TraitKey;
  config: DiceBearAvatarConfig;
  longestStreak: number;
  onSelect: (traitKey: TraitKey, value: string | undefined) => void;
  isDark: boolean;
}

function TraitSection({ traitKey, config, longestStreak, onSelect, isDark }: TraitSectionProps) {
  const options = TRAIT_OPTIONS[traitKey] || [];
  const isColor = COLOR_TRAITS.has(traitKey);
  const allowNone = ALLOW_NONE_TRAITS.has(traitKey);
  const label = TRAIT_LABELS[traitKey] || String(traitKey);
  const selectedValue = (config[traitKey] as string[] | undefined)?.[0];

  const itemConfigs = useMemo(() => {
    if (isColor) return {};
    const result: Record<string, DiceBearAvatarConfig> = {};
    if (allowNone) {
      result["__none__"] = { ...config, [traitKey]: [], ...(traitKey === "facialHair" ? { facialHairProbability: 0 } : {}), ...(traitKey === "accessories" ? { accessoriesProbability: 0 } : {}) };
    }
    for (const value of options) {
      result[value] = {
        ...config,
        [traitKey]: [value],
        ...(traitKey === "facialHair" ? { facialHairProbability: 100 } : {}),
        ...(traitKey === "accessories" ? { accessoriesProbability: 100 } : {}),
      };
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, traitKey, isColor, allowNone]);

  return (
    <div className="mb-5">
      <p className={cn("text-[10px] font-semibold uppercase tracking-[0.2em] px-5 mb-3", isDark ? "text-white/30" : "text-muted-foreground")}>
        {label}
      </p>

      {isColor ? (
        <ColorPalette label="" colors={options} selected={selectedValue} onSelect={(c) => onSelect(traitKey, c)} isDark={isDark} />
      ) : (
        <div className="grid grid-cols-3 gap-2.5 px-5">
          {allowNone && (
            <ShapeItemCard
              value="__none__"
              itemConfig={itemConfigs["__none__"] ?? config}
              selected={!selectedValue}
              locked={false}
              requiredStreak={0}
              onClick={() => onSelect(traitKey, undefined)}
              isDark={isDark}
            />
          )}
          {options.map((value) => {
            const threshold = getUnlockThreshold(String(traitKey), value);
            const locked = !isUnlocked(String(traitKey), value, longestStreak);
            return (
              <ShapeItemCard
                key={value}
                value={value}
                itemConfig={itemConfigs[value] ?? config}
                selected={selectedValue === value}
                locked={locked}
                requiredStreak={threshold}
                onClick={() => {
                  if (locked) {
                    toast(`Complete ${threshold} dias de streak para desbloquear`);
                    return;
                  }
                  onSelect(traitKey, value);
                }}
                isDark={isDark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AvatarCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function AvatarCreator({ isOpen, onClose, userId }: AvatarCreatorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { avatarConfig, saveAvatarConfig, isSavingAvatarConfig, progress } =
    useGamification(userId);

  const longestStreak = progress?.longest_streak ?? 0;

  const [config, setConfig] = useState<DiceBearAvatarConfig>(
    () => (avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG }
  );
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  // Sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig((avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG });
      setActiveCategory(CATEGORIES[0].id);
    }
  }, [isOpen, avatarConfig]);

  const handleSelect = useCallback(
    (traitKey: TraitKey, value: string | undefined) => {
      if (!value) {
        setConfig((prev) => ({
          ...prev, [traitKey]: [],
          ...(traitKey === "facialHair" ? { facialHairProbability: 0 } : {}),
          ...(traitKey === "accessories" ? { accessoriesProbability: 0 } : {}),
        }));
      } else {
        setConfig((prev) => ({
          ...prev, [traitKey]: [value],
          ...(traitKey === "facialHair" ? { facialHairProbability: 100 } : {}),
          ...(traitKey === "accessories" ? { accessoriesProbability: 100 } : {}),
        }));
      }
    }, []
  );

  const randomize = useCallback(() => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const maybePick = <T,>(arr: T[], prob: number): T[] =>
      Math.random() < prob ? [pick(arr)] : [];
    const unlocked = (trait: string, arr: string[]) =>
      arr.filter((v) => isUnlocked(trait, v, longestStreak));

    const tops = unlocked("top", [...HAIR_STYLES, ...HAT_STYLES]);
    const eyes = unlocked("eyes", EYE_TYPES);
    const brows = unlocked("eyebrows", EYEBROW_TYPES);
    const mouths = unlocked("mouth", MOUTH_TYPES);
    const clothes = unlocked("clothing", CLOTHING_TYPES);
    const fh = unlocked("facialHair", FACIAL_HAIR_TYPES);
    const acc = unlocked("accessories", ACCESSORY_TYPES);

    setConfig({
      skinColor: [pick(SKIN_COLORS)], top: tops.length ? [pick(tops)] : [HAIR_STYLES[0]],
      topProbability: 100, hairColor: [pick(HAIR_COLORS)],
      eyes: eyes.length ? [pick(eyes)] : [EYE_TYPES[0]],
      eyebrows: brows.length ? [pick(brows)] : [EYEBROW_TYPES[0]],
      mouth: mouths.length ? [pick(mouths)] : [MOUTH_TYPES[0]],
      facialHair: fh.length ? maybePick(fh, 0.3) : [], facialHairProbability: 100,
      facialHairColor: [pick(HAIR_COLORS)],
      clothing: clothes.length ? [pick(clothes)] : [CLOTHING_TYPES[0]],
      clothesColor: [pick(CLOTHES_COLORS)],
      accessories: acc.length ? maybePick(acc, 0.3) : [], accessoriesProbability: 100,
      backgroundColor: [pick(BG_COLORS)],
    });
  }, [longestStreak]);

  const handleSave = useCallback(async () => {
    try {
      await saveAvatarConfig({ config });
      toast.success("Avatar salvo!");
      onClose();
    } catch {
      toast.error("Erro ao salvar avatar");
    }
  }, [config, saveAvatarConfig, onClose]);

  const activeCategoryData = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={isDark ? { backgroundColor: "#0A0A0A" } : { backgroundColor: "#fff" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-2" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
          <button onClick={onClose} className={cn("p-1.5 rounded-full", isDark ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-600")}>
            <X size={20} />
          </button>
          <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-foreground")}>Customizar Avatar</h2>
          <div className="w-8" />
        </div>

        {/* Avatar preview */}
        <div className="flex-shrink-0 flex justify-center items-center py-4 relative">
          <motion.div
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="w-36 h-36 rounded-full overflow-hidden"
            style={isDark ? {
              backgroundColor: "#141414",
              boxShadow: "0 0 60px rgba(255,255,255,0.08), 0 0 30px rgba(255,255,255,0.05), 0 0 100px rgba(163,230,53,0.04), inset 0 0 20px rgba(0,0,0,0.3)",
            } : {
              backgroundColor: "#f3f4f6",
              boxShadow: "0 0 40px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <AvatarDisplay config={config} size={144} />
          </motion.div>
          {/* Aleatório badge — bottom right of avatar */}
          <button
            onClick={randomize}
            className={cn(
              "absolute bottom-1 right-[15%] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
              isDark
                ? "bg-black/60 text-lime-300 hover:bg-black/80 border border-lime-400/40 backdrop-blur-sm"
                : "bg-white text-lime-700 hover:bg-lime-50 border border-lime-400 shadow-sm"
            )}
          >
            <Shuffle className="w-3 h-3" />
            Aleatório
          </button>
        </div>

        {/* Category tabs — underline style */}
        <div className="flex-shrink-0 flex justify-center gap-1 px-3 mb-4 border-b" style={isDark ? { borderColor: "rgba(255,255,255,0.05)" } : { borderColor: "#e5e7eb" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
                activeCategory === cat.id
                  ? isDark ? "text-white border-lime-400" : "text-foreground border-lime-500"
                  : isDark ? "text-white/40 border-transparent hover:text-white/60" : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Trait sections (scrollable) */}
        <div className={cn("flex-1 min-h-0 overflow-y-auto scrollbar-hide", activeCategory === "skin" && "flex items-center")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pt-1 pb-6 w-full"
            >
              {/* Regular trait sections */}
              {[...activeCategoryData.traits].sort((a, b) => {
                const aIsColor = COLOR_TRAITS.has(a) ? 0 : 1;
                const bIsColor = COLOR_TRAITS.has(b) ? 0 : 1;
                return aIsColor - bIsColor;
              }).map((traitKey) => (
                <TraitSection
                  key={traitKey}
                  traitKey={traitKey}
                  config={config}
                  longestStreak={longestStreak}
                  onSelect={handleSelect}
                  isDark={isDark}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer — single save button with strong glow */}
        <div className="flex-shrink-0 px-5 py-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
          <Button
            className="w-full h-14 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold uppercase tracking-wider text-base border-0"
            style={{ boxShadow: "0 0 40px rgba(163,230,53,0.4), 0 4px 24px rgba(163,230,53,0.3), inset 0 1px 1px rgba(255,255,255,0.3)" }}
            onClick={handleSave}
            disabled={isSavingAvatarConfig}
          >
            {isSavingAvatarConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
            Salvar Avatar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
