import { motion } from "motion/react";

// ============================================================================
// TYPES
// ============================================================================

interface BlobConfig {
  color: string;
  top: string;
  left: string;
  width: number;
  height: number;
  opacity: number;
}

// ============================================================================
// PHASE → BLOB MAP
// ============================================================================

const PHASE_BLOBS: Record<number, { blob1: BlobConfig; blob2: BlobConfig }> = {
  0: { // Welcome · Intro · Objective · PWA-soft — lime warm
    blob1: { color: '#A3E635', top: '-15%', left: '-20%', width: 300, height: 300, opacity: 0.12 },
    blob2: { color: '#84cc16', top: '55%',  left: '55%',  width: 250, height: 250, opacity: 0.08 },
  },
  1: { // Quiz (wake, weekend, life areas, experience) — amber + lime
    blob1: { color: '#F59E0B', top: '-20%', left: '-10%', width: 280, height: 280, opacity: 0.08 },
    blob2: { color: '#A3E635', top: '60%',  left: '50%',  width: 220, height: 220, opacity: 0.06 },
  },
  2: { // Loading · Preview · Confirm — green-lime
    blob1: { color: '#A3E635', top: '35%',  left: '-15%', width: 260, height: 260, opacity: 0.10 },
    blob2: { color: '#4ade80', top: '-15%', left: '50%',  width: 240, height: 240, opacity: 0.07 },
  },
  3: { // Journeys Intro · Journey Select — violet + lime
    blob1: { color: '#8B5CF6', top: '-10%', left: '-20%', width: 300, height: 300, opacity: 0.10 },
    blob2: { color: '#A3E635', top: '55%',  left: '55%',  width: 220, height: 220, opacity: 0.06 },
  },
  4: { // PWA-hard · Notifications · Reminder — blue neutral
    blob1: { color: '#3B82F6', top: '-20%', left: '-15%', width: 260, height: 260, opacity: 0.07 },
    blob2: { color: '#A3E635', top: '60%',  left: '50%',  width: 200, height: 200, opacity: 0.05 },
  },
  5: { // Tour steps (SpotlightOverlay darkens screen anyway — keep subtle)
    blob1: { color: '#A3E635', top: '-20%', left: '-20%', width: 200, height: 200, opacity: 0.05 },
    blob2: { color: '#A3E635', top: '55%',  left: '55%',  width: 180, height: 180, opacity: 0.04 },
  },
  6: { // Celebration — green + lime, expansive
    blob1: { color: '#22c55e', top: '-20%', left: '-10%', width: 320, height: 320, opacity: 0.13 },
    blob2: { color: '#A3E635', top: '50%',  left: '45%',  width: 280, height: 280, opacity: 0.10 },
  },
};

// ============================================================================
// BLOB ELEMENT
// ============================================================================

function Blob({ config }: { config: BlobConfig }) {
  return (
    <motion.div
      aria-hidden
      animate={{
        top: config.top,
        left: config.left,
        width: config.width,
        height: config.height,
        backgroundColor: config.color,
        opacity: config.opacity,
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />
  );
}

// ============================================================================
// EXPORTED COMPONENT
// ============================================================================

export function OnboardingBlobBackground({ phase }: { phase: number }) {
  const blobs = PHASE_BLOBS[phase] ?? PHASE_BLOBS[0];
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <Blob config={blobs.blob1} />
      <Blob config={blobs.blob2} />
    </div>
  );
}
