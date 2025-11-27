/**
 * Premium Celebration Effects System
 *
 * Sophisticated celebration system for gamification events.
 * Uses subtle animations, glow effects, and haptic feedback.
 * NO tacky confetti - only premium micro-interactions.
 */

import { sounds } from "./sounds";
import { isCelebrationsEnabled, isHapticEnabled } from "./preferences";

// ============================================
// TYPES
// ============================================

export type CelebrationType =
  | "habit-complete"
  | "level-up"
  | "streak-milestone"
  | "perfect-day"
  | "unlock";

export interface CelebrationConfig {
  sound?: boolean;
  haptic?: boolean;
  glow?: boolean;
  particles?: boolean;
  duration?: number; // milliseconds
}

// ============================================
// HAPTIC FEEDBACK
// ============================================

/**
 * Trigger haptic feedback on mobile devices
 * Respects user preference for haptic feedback
 */
export const triggerHaptic = (
  pattern: "light" | "medium" | "heavy" = "medium"
): void => {
  // Check if device supports haptic feedback and user has it enabled
  if (!("vibrate" in navigator) || !isHapticEnabled()) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    console.debug("Haptic feedback not supported", error);
  }
};

// ============================================
// GLOW EFFECTS
// ============================================

/**
 * Create a premium glow pulse effect on an element
 * Returns cleanup function
 */
export const createGlowPulse = (
  elementId: string,
  color: string = "rgba(139, 92, 246, 0.6)", // Default purple
  duration: number = 1000
): (() => void) => {
  const element = document.getElementById(elementId);
  if (!element) return () => {};

  // Store original box-shadow
  const originalBoxShadow = element.style.boxShadow;

  // Apply glow animation via CSS
  element.style.transition = `box-shadow ${duration}ms ease-in-out`;
  element.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;

  // Remove glow after duration
  const timeoutId = setTimeout(() => {
    element.style.boxShadow = originalBoxShadow;
  }, duration);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    element.style.boxShadow = originalBoxShadow;
  };
};

// ============================================
// PARTICLE EFFECTS (Subtle, not confetti)
// ============================================

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

/**
 * Create subtle floating particles (NOT confetti)
 * Uses canvas for smooth 60fps animations
 */
export const createSubtleParticles = (
  containerId: string,
  config: {
    count?: number;
    colors?: string[];
    duration?: number;
  } = {}
): (() => void) => {
  const {
    count = 12,
    colors = ["#8B5CF6", "#A78BFA", "#C4B5FD"],
    duration = 2000,
  } = config;

  const container = document.getElementById(containerId);
  if (!container) return () => {};

  // Create canvas overlay
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  container.style.position = "relative";
  container.appendChild(canvas);

  // Create particles
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `particle-${i}`,
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 2, // Float upward
      life: 0,
      maxLife: duration,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    });
  }

  // Animation loop
  let animationId: number;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life = elapsed;

      // Fade out
      particle.opacity = 1 - particle.life / particle.maxLife;

      // Draw particle (circle with glow)
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    canvas.remove();
  };
};

// ============================================
// SCALE PULSE ANIMATION
// ============================================

/**
 * Create a subtle scale pulse effect on an element
 * Returns cleanup function
 */
export const createScalePulse = (
  elementId: string,
  scale: number = 1.05,
  duration: number = 300
): (() => void) => {
  const element = document.getElementById(elementId);
  if (!element) return () => {};

  const originalTransform = element.style.transform;

  // Apply scale animation
  element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  element.style.transform = `scale(${scale})`;

  const timeoutId = setTimeout(() => {
    element.style.transform = originalTransform;
  }, duration);

  return () => {
    clearTimeout(timeoutId);
    element.style.transform = originalTransform;
  };
};

// ============================================
// PREMIUM CELEBRATION ORCHESTRATOR
// ============================================

const DEFAULT_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  "habit-complete": {
    sound: true,
    haptic: true,
    glow: true,
    particles: false,
    duration: 500,
  },
  "level-up": {
    sound: true,
    haptic: true,
    glow: true,
    particles: true,
    duration: 2000,
  },
  "streak-milestone": {
    sound: true,
    haptic: true,
    glow: true,
    particles: true,
    duration: 1500,
  },
  "perfect-day": {
    sound: true,
    haptic: true,
    glow: true,
    particles: true,
    duration: 2000,
  },
  unlock: {
    sound: true,
    haptic: true,
    glow: true,
    particles: false,
    duration: 1000,
  },
};

/**
 * Trigger a premium celebration effect
 *
 * @param type - Type of celebration
 * @param elementId - ID of element to apply effects to (optional)
 * @param config - Override default configuration
 * @returns Cleanup function to stop all effects
 */
export const celebrate = (
  type: CelebrationType,
  elementId?: string,
  config?: Partial<CelebrationConfig>
): (() => void) => {
  const finalConfig = { ...DEFAULT_CONFIGS[type], ...config };
  const cleanups: (() => void)[] = [];

  // Check if visual celebrations are enabled (glow, particles)
  const visualsEnabled = isCelebrationsEnabled();

  // Sound effect (controlled by sounds library preferences)
  if (finalConfig.sound) {
    switch (type) {
      case "habit-complete":
        sounds.complete();
        break;
      case "level-up":
        sounds.levelUp();
        break;
      case "streak-milestone":
        sounds.streak();
        break;
      case "perfect-day":
        sounds.dayComplete();
        break;
      case "unlock":
        sounds.unlock();
        break;
    }
  }

  // Haptic feedback (triggerHaptic checks preference internally)
  if (finalConfig.haptic) {
    const hapticPattern =
      type === "level-up" || type === "perfect-day" ? "heavy" : "medium";
    triggerHaptic(hapticPattern);
  }

  // Visual effects (require elementId AND celebrations enabled)
  if (elementId && visualsEnabled) {
    // Glow pulse
    if (finalConfig.glow) {
      const glowColors = {
        "habit-complete": "rgba(139, 92, 246, 0.6)", // Purple
        "level-up": "rgba(234, 179, 8, 0.7)", // Gold
        "streak-milestone": "rgba(249, 115, 22, 0.6)", // Orange
        "perfect-day": "rgba(34, 197, 94, 0.6)", // Green
        unlock: "rgba(59, 130, 246, 0.6)", // Blue
      };
      cleanups.push(
        createGlowPulse(
          elementId,
          glowColors[type],
          finalConfig.duration || 1000
        )
      );
    }

    // Scale pulse
    const scaleAmount =
      type === "level-up" || type === "perfect-day" ? 1.08 : 1.04;
    cleanups.push(createScalePulse(elementId, scaleAmount, 300));

    // Subtle particles
    if (finalConfig.particles) {
      const particleColors = {
        "level-up": ["#EAB308", "#FCD34D", "#FEF08A"],
        "streak-milestone": ["#F97316", "#FB923C", "#FDBA74"],
        "perfect-day": ["#22C55E", "#4ADE80", "#86EFAC"],
        unlock: ["#3B82F6", "#60A5FA", "#93C5FD"],
        "habit-complete": ["#8B5CF6", "#A78BFA", "#C4B5FD"],
      };
      cleanups.push(
        createSubtleParticles(elementId, {
          count: type === "level-up" || type === "perfect-day" ? 20 : 12,
          colors: particleColors[type],
          duration: finalConfig.duration || 2000,
        })
      );
    }
  }

  // Return master cleanup function
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};

// ============================================
// EXPORTED CELEBRATION SHORTCUTS
// ============================================

export const celebrations = {
  habitComplete: (elementId?: string) =>
    celebrate("habit-complete", elementId),
  levelUp: (elementId?: string) => celebrate("level-up", elementId),
  streakMilestone: (elementId?: string) =>
    celebrate("streak-milestone", elementId),
  perfectDay: (elementId?: string) => celebrate("perfect-day", elementId),
  unlock: (elementId?: string) => celebrate("unlock", elementId),

  // Generic celebration with custom config
  custom: (
    type: CelebrationType,
    elementId?: string,
    config?: Partial<CelebrationConfig>
  ) => celebrate(type, elementId, config),
};
