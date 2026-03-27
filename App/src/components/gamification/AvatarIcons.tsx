import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

// ============================================
// DiceBear Avataaars Config Types
// ============================================

export interface DiceBearAvatarConfig {
  skinColor?: string[];
  top?: string[];
  topProbability?: number;
  hairColor?: string[];
  hatColor?: string[];
  eyes?: string[];
  eyebrows?: string[];
  mouth?: string[];
  nose?: string[];
  facialHair?: string[];
  facialHairProbability?: number;
  facialHairColor?: string[];
  clothing?: string[];
  clothesColor?: string[];
  clothingGraphic?: string[];
  accessories?: string[];
  accessoriesProbability?: number;
  accessoriesColor?: string[];
  backgroundColor?: string[];
  style?: string[];
}

// ============================================
// Option Enums (from DiceBear avataaars schema)
// ============================================

export const SKIN_COLORS = ["614335", "d08b5b", "ae5d29", "edb98a", "ffdbb4", "fd9841", "f8d25c", "c68642", "8d5524", "e0ac69", "f1c27d", "ffdbac"];

export const HAIR_STYLES = [
  "bob", "bun", "curly", "curvy", "dreads", "dreads01", "dreads02",
  "frida", "fro", "froBand", "frizzle", "longButNotTooLong", "miaWallace",
  "shavedSides", "shaggy", "shaggyMullet", "shortCurly", "shortFlat",
  "shortRound", "shortWaved", "sides", "straight01", "straight02",
  "straightAndStrand", "theCaesar", "theCaesarAndSidePart", "bigHair",
];

export const HAT_STYLES = ["hat", "hijab", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04"];

export const HAIR_COLORS = ["a55728", "2c1b18", "b58143", "d6b370", "724133", "4a312c", "f59797", "ecdcbf", "c93305", "e8e1e1"];

export const EYE_TYPES = ["default", "happy", "closed", "cry", "eyeRoll", "hearts", "side", "squint", "surprised", "wink", "winkWacky", "xDizzy"];

export const EYEBROW_TYPES = [
  "defaultNatural", "angryNatural", "flatNatural", "frownNatural",
  "raisedExcitedNatural", "sadConcernedNatural", "unibrowNatural", "upDownNatural",
  "default", "angry", "raisedExcited", "sadConcerned", "upDown",
];

export const MOUTH_TYPES = ["default", "smile", "twinkle", "tongue", "concerned", "disbelief", "eating", "grimace", "sad", "screamOpen", "serious", "vomit"];

export const FACIAL_HAIR_TYPES = ["beardLight", "beardMedium", "beardMajestic", "moustacheFancy", "moustacheMagnum"];

export const CLOTHING_TYPES = ["blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"];

export const CLOTHES_COLORS = ["262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "3c4f5c", "b1e2ff", "a7ffc4", "ffafb9", "ffffb1", "ff488e", "ff5c5c", "ffffff"];

export const CLOTHING_GRAPHIC_TYPES = ["bat", "bear", "cumbia", "deer", "diamond", "hola", "pizza", "resist", "skull", "skullOutline"];

export const ACCESSORY_TYPES = ["kurt", "prescription01", "prescription02", "round", "sunglasses", "wayfarers", "eyepatch"];

export const BG_COLORS = ["65c9ff", "b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "ffffff", "f0f0f0"];

// ============================================
// Default Config
// ============================================

export const DEFAULT_AVATAR_CONFIG: DiceBearAvatarConfig = {
  skinColor: ["ffdbb4"],
  top: ["shortFlat"],
  topProbability: 100,
  hairColor: ["2c1b18"],
  eyes: ["default"],
  eyebrows: ["defaultNatural"],
  mouth: ["smile"],
  clothing: ["hoodie"],
  clothesColor: ["65c9ff"],
  accessories: [],
  accessoriesProbability: 0,
  facialHair: [],
  facialHairProbability: 0,
  backgroundColor: ["65c9ff"],
};

// ============================================
// SVG Generation (safe: config values come from predefined enums, not user HTML)
// ============================================

export function generateAvatarSvg(config?: DiceBearAvatarConfig | null): string {
  return createAvatar(avataaars, {
    ...(config || DEFAULT_AVATAR_CONFIG),
  }).toString();
}

// ============================================
// React Component
// ============================================

export function AvatarDisplay({
  config,
  size = 40,
  className,
}: {
  config?: DiceBearAvatarConfig | null;
  size?: number;
  className?: string;
}) {
  // SVG is generated from DiceBear library with predefined enum values — safe to render
  // Use JSON.stringify for value-based comparison (not reference-based)
  const configKey = JSON.stringify(config);
  const svg = useMemo(() => generateAvatarSvg(config), [configKey]);

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg.replace(/<svg /, '<svg style="width:100%;height:100%;display:block" ') }}
    />
  );
}

// ============================================
// Legacy Backward Compat (remove in cleanup PR)
// ============================================

export type AvatarIconKey = string;
export const DEFAULT_AVATAR_ICON = "smile_basic";
export const getAvatarIcon = (_key?: string | null) => null;
