import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Check, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";
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

// Traits that use color circles instead of mini avatar previews
const COLOR_TRAITS = new Set<TraitKey>([
  "skinColor", "hairColor", "clothesColor", "backgroundColor",
  "facialHairColor", "accessoriesColor", "hatColor",
]);

// Traits that support a "none / no selection" option
const ALLOW_NONE_TRAITS = new Set<TraitKey>(["facialHair", "accessories"]);

// Option arrays per trait
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
  accessories:     ACCESSORY_TYPES,
  backgroundColor: BG_COLORS,
};

// Section labels in Portuguese
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
  accessories:     "Acessórios",
  backgroundColor: "Cor de Fundo",
};

// Individual option labels in Portuguese
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
  kurt: "Kurt", prescription01: "Óculos 1", prescription02: "Óculos 2",
  round: "Redondo", sunglasses: "Óculos de Sol", wayfarers: "Wayfarer", eyepatch: "Tapa-olho",
};

// ============================================================================
// COLOR PALETTE
// ============================================================================

function ColorPalette({
  label,
  colors,
  selected,
  onSelect,
}: {
  label: string;
  colors: string[];
  selected: string | undefined;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="space-y-2 px-4">
      {label && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="w-9 h-9 rounded-full border-2 transition-transform focus:outline-none"
            style={{
              backgroundColor: `#${color}`,
              borderColor: selected === color ? "var(--primary)" : "transparent",
              transform: selected === color ? "scale(1.2)" : undefined,
              boxShadow:
                selected === color
                  ? "0 0 0 2px var(--background), 0 0 0 4px var(--primary)"
                  : undefined,
            }}
            aria-label={`Cor #${color}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SHAPE ITEM CARD — uses AvatarDisplay (existing component) for SVG rendering
// ============================================================================

interface ShapeItemCardProps {
  value: string;
  itemConfig: DiceBearAvatarConfig;
  selected: boolean;
  locked: boolean;
  requiredStreak: number;
  onClick: () => void;
}

function ShapeItemCard({
  value,
  itemConfig,
  selected,
  locked,
  requiredStreak,
  onClick,
}: ShapeItemCardProps) {
  const label = value === "__none__" ? "Nenhum" : (OPTION_LABELS[value] || value);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 w-[72px] flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all focus:outline-none",
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : locked
            ? "border-border/40 bg-muted/20 cursor-default"
            : "border-border bg-card active:scale-95",
      )}
    >
      {/* Mini avatar — uses AvatarDisplay which handles SVG rendering */}
      <div className={cn("w-12 h-12 rounded-lg overflow-hidden", locked && "grayscale opacity-40")}>
        <AvatarDisplay config={itemConfig} size={48} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[9px] font-medium leading-tight text-center line-clamp-2 w-full",
          selected
            ? "text-primary"
            : locked
              ? "text-muted-foreground/40"
              : "text-muted-foreground",
        )}
      >
        {label}
      </span>

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl gap-0.5">
          <Lock className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-[8px] font-bold text-muted-foreground/50">{requiredStreak}d</span>
        </div>
      )}

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ============================================================================
// TRAIT SECTION — color palette or shape carousel
// ============================================================================

interface TraitSectionProps {
  traitKey: TraitKey;
  config: DiceBearAvatarConfig;
  longestStreak: number;
  onSelect: (traitKey: TraitKey, value: string | undefined) => void;
}

function TraitSection({ traitKey, config, longestStreak, onSelect }: TraitSectionProps) {
  const options = TRAIT_OPTIONS[traitKey] || [];
  const isColor = COLOR_TRAITS.has(traitKey);
  const allowNone = ALLOW_NONE_TRAITS.has(traitKey);
  const label = TRAIT_LABELS[traitKey] || String(traitKey);
  const selectedValue = (config[traitKey] as string[] | undefined)?.[0];

  // Pre-compute per-option configs so ShapeItemCard receives stable props
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
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 mb-3">
        {label}
      </p>

      {isColor ? (
        <ColorPalette
          label=""
          colors={options}
          selected={selectedValue}
          onSelect={(c) => onSelect(traitKey, c)}
        />
      ) : (
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {allowNone && (
            <ShapeItemCard
              value="__none__"
              itemConfig={itemConfigs["__none__"] ?? config}
              selected={!selectedValue}
              locked={false}
              requiredStreak={0}
              onClick={() => onSelect(traitKey, undefined)}
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
  const { avatarConfig, saveAvatarConfig, isSavingAvatarConfig, progress } =
    useGamification(userId);

  const longestStreak = progress?.longest_streak ?? 0;

  // Local edit state
  const [config, setConfig] = useState<DiceBearAvatarConfig>(
    () => (avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG }
  );
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  // Sync when drawer opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setConfig((avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG });
        setActiveCategory(CATEGORIES[0].id);
      } else {
        onClose();
      }
    },
    [avatarConfig, onClose]
  );

  // Update a single trait
  const handleSelect = useCallback(
    (traitKey: TraitKey, value: string | undefined) => {
      if (!value) {
        setConfig((prev) => ({
          ...prev,
          [traitKey]: [],
          ...(traitKey === "facialHair" ? { facialHairProbability: 0 } : {}),
          ...(traitKey === "accessories" ? { accessoriesProbability: 0 } : {}),
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          [traitKey]: [value],
          ...(traitKey === "facialHair" ? { facialHairProbability: 100 } : {}),
          ...(traitKey === "accessories" ? { accessoriesProbability: 100 } : {}),
        }));
      }
    },
    []
  );

  // Randomize — only from unlocked options
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
      skinColor:            [pick(SKIN_COLORS)],
      top:                  tops.length ? [pick(tops)] : [HAIR_STYLES[0]],
      topProbability:       100,
      hairColor:            [pick(HAIR_COLORS)],
      eyes:                 eyes.length ? [pick(eyes)] : [EYE_TYPES[0]],
      eyebrows:             brows.length ? [pick(brows)] : [EYEBROW_TYPES[0]],
      mouth:                mouths.length ? [pick(mouths)] : [MOUTH_TYPES[0]],
      facialHair:           fh.length ? maybePick(fh, 0.3) : [],
      facialHairProbability: 100,
      facialHairColor:      [pick(HAIR_COLORS)],
      clothing:             clothes.length ? [pick(clothes)] : [CLOTHING_TYPES[0]],
      clothesColor:         [pick(CLOTHES_COLORS)],
      accessories:          acc.length ? maybePick(acc, 0.3) : [],
      accessoriesProbability: 100,
      backgroundColor:      [pick(BG_COLORS)],
    });
  }, [longestStreak]);

  // Save
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

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="flex flex-col overflow-hidden rounded-t-3xl" style={{ height: "96dvh" }}>

        {/* ── Large avatar preview ── */}
        <div
          className="flex-shrink-0 flex justify-center items-center"
          style={{ height: "38dvh" }}
        >
          <motion.div
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl"
          >
            <AvatarDisplay config={config} size={164} />
          </motion.div>
        </div>

        {/* ── Category tab row ── */}
        <div className="flex-shrink-0 flex gap-2 overflow-x-auto px-4 pb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground active:bg-muted/80",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Trait sections (scrollable) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pt-1 pb-6"
            >
              {activeCategoryData.traits.map((traitKey) => (
                <TraitSection
                  key={traitKey}
                  traitKey={traitKey}
                  config={config}
                  longestStreak={longestStreak}
                  onSelect={handleSelect}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer: Randomize + Save ── */}
        <DrawerFooter className="flex-row gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={randomize}>
            <Shuffle className="w-4 h-4 mr-2" />
            Aleatório
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isSavingAvatarConfig}
          >
            {isSavingAvatarConfig ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </DrawerFooter>

      </DrawerContent>
    </Drawer>
  );
}
