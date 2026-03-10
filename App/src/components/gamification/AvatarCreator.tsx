import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { Shuffle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useGamification } from "@/hooks/useGamification";
import { toast } from "sonner";
import {
  type DiceBearAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  generateAvatarSvg,
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

// ============================================
// Sub-components
// ============================================

/** Grid of clickable color circles */
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
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{
              backgroundColor: `#${color}`,
              borderColor: selected === color ? "var(--primary)" : "transparent",
              transform: selected === color ? "scale(1.15)" : undefined,
            }}
            aria-label={`Cor #${color}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Label map for option names in Portuguese */
const OPTION_LABELS: Record<string, string> = {
  // Hair styles
  bob: "Bob", bun: "Coque", curly: "Cacheado", curvy: "Ondulado",
  dreads: "Dreads", dreads01: "Dreads 2", dreads02: "Dreads 3",
  frida: "Frida", fro: "Afro", froBand: "Afro c/ Faixa", frizzle: "Frizz",
  longButNotTooLong: "Medio", miaWallace: "Liso Longo",
  shavedSides: "Raspado Lados", shaggy: "Desgrenhado", shaggyMullet: "Mullet",
  shortCurly: "Curto Cacheado", shortFlat: "Curto Liso", shortRound: "Curto Redondo",
  shortWaved: "Curto Ondulado", sides: "Laterais", straight01: "Liso 1",
  straight02: "Liso 2", straightAndStrand: "Liso c/ Mecha",
  theCaesar: "Caesar", theCaesarAndSidePart: "Caesar c/ Risco", bigHair: "Volume",
  // Hats
  hat: "Bone", hijab: "Hijab", turban: "Turbante",
  winterHat1: "Touca 1", winterHat02: "Touca 2", winterHat03: "Touca 3", winterHat04: "Touca 4",
  // Eyes
  default: "Normal", happy: "Feliz", closed: "Fechado", cry: "Chorando",
  eyeRoll: "Revirando", hearts: "Coracoes", side: "Lateral",
  squint: "Apertado", surprised: "Surpreso", wink: "Piscando",
  winkWacky: "Piscar Maluco", xDizzy: "Tonto",
  // Eyebrows
  defaultNatural: "Natural", angryNatural: "Bravo", flatNatural: "Reto",
  frownNatural: "Franzido", raisedExcitedNatural: "Empolgado",
  sadConcernedNatural: "Triste", unibrowNatural: "Monocelha",
  upDownNatural: "Assimetrico", angry: "Bravo Fino",
  raisedExcited: "Empolgado Fino", sadConcerned: "Triste Fino", upDown: "Assimetrico Fino",
  // Mouth
  smile: "Sorriso", twinkle: "Brilhante", tongue: "Lingua",
  concerned: "Preocupado", disbelief: "Incredulo", eating: "Comendo",
  grimace: "Careta", sad: "Triste", screamOpen: "Gritando", serious: "Serio", vomit: "Enjoado",
  // Facial hair
  beardLight: "Barba Leve", beardMedium: "Barba Media", beardMajestic: "Barbona",
  moustacheFancy: "Bigode Fino", moustacheMagnum: "Bigodao",
  // Clothing
  blazerAndShirt: "Blazer", blazerAndSweater: "Blazer + Sueter",
  collarAndSweater: "Gola + Sueter", graphicShirt: "Camiseta Estampa",
  hoodie: "Moletom", overall: "Macacao", shirtCrewNeck: "Camiseta",
  shirtScoopNeck: "Regata", shirtVNeck: "Gola V",
  // Accessories
  kurt: "Kurt", prescription01: "Oculos 1", prescription02: "Oculos 2",
  round: "Redondo", sunglasses: "Oculos de Sol", wayfarers: "Wayfarer", eyepatch: "Tapa-olho",
};

/** Grid of named option buttons */
function OptionGrid({
  label,
  options,
  selected,
  onSelect,
  allowNone,
}: {
  label: string;
  options: string[];
  selected: string | undefined;
  onSelect: (option: string | undefined) => void;
  allowNone?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {allowNone && (
          <button
            onClick={() => onSelect(undefined)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Nenhum
          </button>
        )}
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selected === opt
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {OPTION_LABELS[opt] || opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface AvatarCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function AvatarCreator({ isOpen, onClose, userId }: AvatarCreatorProps) {
  const { avatarConfig, saveAvatarConfig, isSavingAvatarConfig } =
    useGamification(userId);

  // Local state for editing (not saved until "Salvar")
  const [config, setConfig] = useState<DiceBearAvatarConfig>(
    () => (avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG }
  );

  // Sync when drawer opens with latest saved config
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setConfig(
          (avatarConfig as DiceBearAvatarConfig) || { ...DEFAULT_AVATAR_CONFIG }
        );
      } else {
        onClose();
      }
    },
    [avatarConfig, onClose]
  );

  // Update a single config property
  const updateConfig = useCallback(
    (key: keyof DiceBearAvatarConfig, value: string[] | number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Set a single-value array property
  const setSingle = useCallback(
    (key: keyof DiceBearAvatarConfig, value: string | undefined) => {
      if (!value) {
        // For "none" options (facial hair, accessories)
        setConfig((prev) => ({
          ...prev,
          [key]: [],
          ...(key === "facialHair" ? { facialHairProbability: 0 } : {}),
          ...(key === "accessories" ? { accessoriesProbability: 0 } : {}),
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          [key]: [value],
          ...(key === "facialHair" ? { facialHairProbability: 100 } : {}),
          ...(key === "accessories" ? { accessoriesProbability: 100 } : {}),
        }));
      }
    },
    []
  );

  // Randomize
  const randomize = useCallback(() => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const maybePick = <T,>(arr: T[], prob: number) =>
      Math.random() < prob ? [pick(arr)] : [];

    setConfig({
      skinColor: [pick(SKIN_COLORS)],
      top: [pick([...HAIR_STYLES, ...HAT_STYLES])],
      topProbability: 100,
      hairColor: [pick(HAIR_COLORS)],
      eyes: [pick(EYE_TYPES)],
      eyebrows: [pick(EYEBROW_TYPES)],
      mouth: [pick(MOUTH_TYPES)],
      facialHair: maybePick(FACIAL_HAIR_TYPES, 0.3),
      facialHairProbability: 100,
      facialHairColor: [pick(HAIR_COLORS)],
      clothing: [pick(CLOTHING_TYPES)],
      clothesColor: [pick(CLOTHES_COLORS)],
      accessories: maybePick(ACCESSORY_TYPES, 0.3),
      accessoriesProbability: 100,
      backgroundColor: [pick(BG_COLORS)],
    });
  }, []);

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

  // Live preview SVG — generated from DiceBear library with predefined enum values, safe to render
  const previewSvg = useMemo(() => generateAvatarSvg(config), [config]);

  // Current selections for UI state
  const sel = {
    skinColor: config.skinColor?.[0],
    top: config.top?.[0],
    hairColor: config.hairColor?.[0],
    eyes: config.eyes?.[0],
    eyebrows: config.eyebrows?.[0],
    mouth: config.mouth?.[0],
    facialHair: config.facialHair?.[0],
    facialHairColor: config.facialHairColor?.[0],
    clothing: config.clothing?.[0],
    clothesColor: config.clothesColor?.[0],
    accessories: config.accessories?.[0],
    backgroundColor: config.backgroundColor?.[0],
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-center">Customize Seu Avatar</DrawerTitle>
        </DrawerHeader>

        {/* Live Preview — SVG from DiceBear with predefined values, safe */}
        <div className="flex justify-center py-3">
          <motion.div
            key={previewSvg.length}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-2 border-primary/30"
            dangerouslySetInnerHTML={{ __html: previewSvg.replace(/<svg /, '<svg style="width:100%;height:100%;display:block" ') }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rosto" className="flex-1 px-4">
          <TabsList className="w-full grid grid-cols-6 h-9">
            <TabsTrigger value="rosto" className="text-xs px-1">Rosto</TabsTrigger>
            <TabsTrigger value="cabelo" className="text-xs px-1">Cabelo</TabsTrigger>
            <TabsTrigger value="olhos" className="text-xs px-1">Olhos</TabsTrigger>
            <TabsTrigger value="boca" className="text-xs px-1">Boca</TabsTrigger>
            <TabsTrigger value="roupa" className="text-xs px-1">Roupa</TabsTrigger>
            <TabsTrigger value="extras" className="text-xs px-1">Extras</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[28vh] mt-3">
            <TabsContent value="rosto" className="space-y-4 mt-0">
              <ColorPalette
                label="Cor da Pele"
                colors={SKIN_COLORS}
                selected={sel.skinColor}
                onSelect={(c) => updateConfig("skinColor", [c])}
              />
              <OptionGrid
                label="Sobrancelha"
                options={EYEBROW_TYPES}
                selected={sel.eyebrows}
                onSelect={(v) => setSingle("eyebrows", v)}
              />
            </TabsContent>

            <TabsContent value="cabelo" className="space-y-4 mt-0">
              <OptionGrid
                label="Estilo"
                options={[...HAIR_STYLES, ...HAT_STYLES]}
                selected={sel.top}
                onSelect={(v) => setSingle("top", v)}
              />
              <ColorPalette
                label="Cor do Cabelo"
                colors={HAIR_COLORS}
                selected={sel.hairColor}
                onSelect={(c) => updateConfig("hairColor", [c])}
              />
            </TabsContent>

            <TabsContent value="olhos" className="space-y-4 mt-0">
              <OptionGrid
                label="Tipo de Olho"
                options={EYE_TYPES}
                selected={sel.eyes}
                onSelect={(v) => setSingle("eyes", v)}
              />
            </TabsContent>

            <TabsContent value="boca" className="space-y-4 mt-0">
              <OptionGrid
                label="Tipo de Boca"
                options={MOUTH_TYPES}
                selected={sel.mouth}
                onSelect={(v) => setSingle("mouth", v)}
              />
              <OptionGrid
                label="Barba"
                options={FACIAL_HAIR_TYPES}
                selected={sel.facialHair}
                onSelect={(v) => setSingle("facialHair", v)}
                allowNone
              />
              <ColorPalette
                label="Cor da Barba"
                colors={HAIR_COLORS}
                selected={sel.facialHairColor}
                onSelect={(c) => updateConfig("facialHairColor", [c])}
              />
            </TabsContent>

            <TabsContent value="roupa" className="space-y-4 mt-0">
              <OptionGrid
                label="Tipo"
                options={CLOTHING_TYPES}
                selected={sel.clothing}
                onSelect={(v) => setSingle("clothing", v)}
              />
              <ColorPalette
                label="Cor da Roupa"
                colors={CLOTHES_COLORS}
                selected={sel.clothesColor}
                onSelect={(c) => updateConfig("clothesColor", [c])}
              />
            </TabsContent>

            <TabsContent value="extras" className="space-y-4 mt-0">
              <OptionGrid
                label="Acessorios"
                options={ACCESSORY_TYPES}
                selected={sel.accessories}
                onSelect={(v) => setSingle("accessories", v)}
                allowNone
              />
              <ColorPalette
                label="Cor de Fundo"
                colors={BG_COLORS}
                selected={sel.backgroundColor}
                onSelect={(c) => updateConfig("backgroundColor", [c])}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DrawerFooter className="flex-row gap-3 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={randomize}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Aleatorio
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
