/**
 * Premium Animation Configurations for Habitz Landing Page
 * Using Framer Motion (motion library)
 */

// Spring physics for natural button interactions
export const springTransition = {
  type: "spring" as const,
  stiffness: 210,
  damping: 16,
  mass: 0.7,
};

// Softer spring for larger elements
export const softSpringTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 20,
  mass: 1,
};

// Standard easing transitions
export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const slowTransition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: smoothTransition,
};

// Fade in from bottom
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: smoothTransition,
};

// Fade in from top
export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: smoothTransition,
};

// Scale in animation
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: smoothTransition,
};

// Blur in animation
export const blurIn = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: slowTransition,
};

// Button hover/tap effects
export const buttonHoverTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: springTransition,
};

// Card hover effect
export const cardHover = {
  whileHover: {
    scale: 1.02,
    y: -4,
    transition: softSpringTransition,
  },
};

// Stagger children animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// Hero circle progress animation
export const progressCircle = {
  initial: { strokeDashoffset: 364 },
  animate: { strokeDashoffset: 91 },
  transition: {
    duration: 1.5,
    ease: [0.4, 0, 0.2, 1],
    delay: 0.5,
  },
};

// Celebration particle effect
export const celebrationParticle = (index: number) => ({
  initial: {
    opacity: 1,
    scale: 0,
    x: 0,
    y: 0,
  },
  animate: {
    opacity: 0,
    scale: 1.5,
    x: Math.cos((index / 8) * Math.PI * 2) * 60,
    y: Math.sin((index / 8) * Math.PI * 2) * 60,
  },
  transition: {
    duration: 0.6,
    ease: "easeOut",
    delay: index * 0.05,
  },
});

// Pulse glow animation
export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(163, 230, 53, 0.3)",
      "0 0 40px rgba(163, 230, 53, 0.5)",
      "0 0 20px rgba(163, 230, 53, 0.3)",
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Float animation for decorative elements
export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: smoothTransition,
};

// Viewport animation trigger
export const viewportOnce = {
  once: true,
  margin: "-50px",
};

// Helper function for staggered delays
export const getStaggerDelay = (index: number, baseDelay = 0.1) => ({
  transition: {
    ...smoothTransition,
    delay: index * baseDelay,
  },
});
