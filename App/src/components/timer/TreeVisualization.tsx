import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface TreeVisualizationProps {
  /** Progress percentage 0-100 */
  progress: number;
  /** Size of the visualization */
  size?: number;
  /** Dark mode */
  isDarkMode?: boolean;
  /** Additional className */
  className?: string;
}

type TreeStage = "seed" | "sprout" | "plant" | "tree" | "fullTree";

function getTreeStage(progress: number): TreeStage {
  if (progress < 20) return "seed";
  if (progress < 40) return "sprout";
  if (progress < 60) return "plant";
  if (progress < 80) return "tree";
  return "fullTree";
}

function getStageLabel(stage: TreeStage): string {
  const labels: Record<TreeStage, string> = {
    seed: "Semente plantada",
    sprout: "Brotando...",
    plant: "Crescendo...",
    tree: "Quase lá!",
    fullTree: "Completo!",
  };
  return labels[stage];
}

// SVG Components for each stage
const SeedSVG = ({ colors }: { colors: TreeColors }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Ground */}
    <ellipse cx="100" cy="170" rx="60" ry="15" fill={colors.ground} />

    {/* Seed */}
    <motion.ellipse
      cx="100"
      cy="155"
      rx="12"
      ry="8"
      fill={colors.seed}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    />

    {/* Sparkle effect */}
    <motion.circle
      cx="95"
      cy="150"
      r="3"
      fill={colors.sparkle}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
  </svg>
);

const SproutSVG = ({ colors }: { colors: TreeColors }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Ground */}
    <ellipse cx="100" cy="170" rx="60" ry="15" fill={colors.ground} />

    {/* Stem */}
    <motion.path
      d="M100 165 Q100 140 100 120"
      stroke={colors.stem}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />

    {/* First leaves */}
    <motion.path
      d="M100 130 Q85 120 90 105 Q100 115 100 130"
      fill={colors.leaf}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />
    <motion.path
      d="M100 130 Q115 120 110 105 Q100 115 100 130"
      fill={colors.leaf}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    />
  </svg>
);

const PlantSVG = ({ colors }: { colors: TreeColors }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Ground */}
    <ellipse cx="100" cy="170" rx="60" ry="15" fill={colors.ground} />

    {/* Main stem */}
    <motion.path
      d="M100 165 Q100 120 100 80"
      stroke={colors.stem}
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />

    {/* Branches */}
    <motion.path
      d="M100 130 Q75 115 70 100"
      stroke={colors.stem}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
    <motion.path
      d="M100 110 Q125 95 130 80"
      stroke={colors.stem}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />

    {/* Leaves */}
    <motion.ellipse
      cx="65"
      cy="95"
      rx="15"
      ry="10"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    />
    <motion.ellipse
      cx="135"
      cy="75"
      rx="15"
      ry="10"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    />
    <motion.ellipse
      cx="100"
      cy="70"
      rx="18"
      ry="12"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    />
  </svg>
);

const TreeSVG = ({ colors }: { colors: TreeColors }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Ground */}
    <ellipse cx="100" cy="175" rx="70" ry="15" fill={colors.ground} />

    {/* Trunk */}
    <motion.rect
      x="90"
      y="120"
      width="20"
      height="55"
      rx="3"
      fill={colors.trunk}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      style={{ originY: 1 }}
      transition={{ duration: 0.6 }}
    />

    {/* Foliage layers */}
    <motion.ellipse
      cx="100"
      cy="100"
      rx="45"
      ry="35"
      fill={colors.foliage}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
    <motion.ellipse
      cx="100"
      cy="75"
      rx="35"
      ry="30"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />
    <motion.ellipse
      cx="100"
      cy="55"
      rx="25"
      ry="20"
      fill={colors.foliage}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    />
  </svg>
);

const FullTreeSVG = ({ colors }: { colors: TreeColors }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    {/* Ground with grass */}
    <ellipse cx="100" cy="180" rx="80" ry="18" fill={colors.ground} />

    {/* Trunk */}
    <motion.rect
      x="88"
      y="120"
      width="24"
      height="60"
      rx="4"
      fill={colors.trunk}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      style={{ originY: 1 }}
      transition={{ duration: 0.6 }}
    />

    {/* Full foliage */}
    <motion.ellipse
      cx="100"
      cy="95"
      rx="55"
      ry="45"
      fill={colors.foliage}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
    <motion.ellipse
      cx="70"
      cy="80"
      rx="30"
      ry="25"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    />
    <motion.ellipse
      cx="130"
      cy="80"
      rx="30"
      ry="25"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    />
    <motion.ellipse
      cx="100"
      cy="55"
      rx="40"
      ry="30"
      fill={colors.foliage}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    />
    <motion.ellipse
      cx="100"
      cy="35"
      rx="25"
      ry="18"
      fill={colors.leaf}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    />

    {/* Fruits/flowers for completed state */}
    {[
      { cx: 75, cy: 70 },
      { cx: 125, cy: 75 },
      { cx: 90, cy: 50 },
      { cx: 110, cy: 45 },
      { cx: 65, cy: 95 },
      { cx: 135, cy: 90 },
    ].map((pos, i) => (
      <motion.circle
        key={i}
        cx={pos.cx}
        cy={pos.cy}
        r="6"
        fill={colors.fruit}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
      />
    ))}

    {/* Sparkles */}
    {[
      { cx: 60, cy: 40 },
      { cx: 140, cy: 50 },
      { cx: 100, cy: 25 },
    ].map((pos, i) => (
      <motion.circle
        key={`sparkle-${i}`}
        cx={pos.cx}
        cy={pos.cy}
        r="4"
        fill={colors.sparkle}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
      />
    ))}
  </svg>
);

interface TreeColors {
  ground: string;
  seed: string;
  stem: string;
  leaf: string;
  trunk: string;
  foliage: string;
  fruit: string;
  sparkle: string;
}

const darkColors: TreeColors = {
  ground: "#3d2914",
  seed: "#8B4513",
  stem: "#228B22",
  leaf: "#A3E635",
  trunk: "#5D4037",
  foliage: "#65A30D",
  fruit: "#FBBF24",
  sparkle: "#FEF08A",
};

const lightColors: TreeColors = {
  ground: "#5D4037",
  seed: "#8B4513",
  stem: "#2E7D32",
  leaf: "#4CAF50",
  trunk: "#6D4C41",
  foliage: "#66BB6A",
  fruit: "#FFB300",
  sparkle: "#FFF59D",
};

export const TreeVisualization = ({
  progress,
  size = 200,
  isDarkMode = true,
  className,
}: TreeVisualizationProps) => {
  const stage = getTreeStage(progress);
  const colors = isDarkMode ? darkColors : lightColors;

  const TreeComponent = {
    seed: SeedSVG,
    sprout: SproutSVG,
    plant: PlantSVG,
    tree: TreeSVG,
    fullTree: FullTreeSVG,
  }[stage];

  return (
    <div
      className={cn("relative flex flex-col items-center", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <TreeComponent colors={colors} />
        </motion.div>
      </AnimatePresence>

      {/* Stage label */}
      <motion.p
        key={`label-${stage}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "absolute -bottom-6 text-xs font-medium",
          isDarkMode ? "text-lime-400" : "text-primary"
        )}
      >
        {getStageLabel(stage)}
      </motion.p>
    </div>
  );
};

export default TreeVisualization;
