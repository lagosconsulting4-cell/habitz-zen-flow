import { motion, useReducedMotion } from "motion/react";

// ============================================================================
// IllustrationFocus — S0 Welcome
// Anéis concêntricos convergindo para um ponto: representa clareza e foco.
// ============================================================================

export function IllustrationFocus() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 22 }}
      className="flex items-center justify-center mb-6"
      aria-hidden
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Outer ring */}
        <motion.circle
          cx="60" cy="60" r="54"
          stroke="#A3E635" strokeWidth="1" strokeOpacity={0.2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0 }}
        />
        {/* Middle ring */}
        <motion.circle
          cx="60" cy="60" r="36"
          stroke="#A3E635" strokeWidth="1.5" strokeOpacity={0.4}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
        />
        {/* Inner ring */}
        <motion.circle
          cx="60" cy="60" r="18"
          stroke="#A3E635" strokeWidth="2" strokeOpacity={0.7}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.6 }}
        />
        {/* Center dot */}
        <motion.circle
          cx="60" cy="60" r="5"
          fill="#A3E635"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ transformOrigin: "60px 60px" }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 1 }}
        />
        {/* Cardinal accent dots on outer ring */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <motion.circle
              key={deg}
              cx={60 + 54 * Math.cos(rad)}
              cy={60 + 54 * Math.sin(rad)}
              r="2.5"
              fill="#A3E635"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.3 }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}

// ============================================================================
// IllustrationBrandMark — S1 AppIntro
// Três círculos sobrepostos: consistência, ritmo, ciência.
// ============================================================================

export function IllustrationBrandMark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center mb-6"
      aria-hidden
    >
      <svg width="96" height="40" viewBox="0 0 96 40" fill="none">
        {[16, 48, 80].map((cx, i) => (
          <g key={cx}>
            <motion.circle
              cx={cx} cy={20} r={16}
              stroke="#A3E635"
              strokeWidth="1.5"
              strokeOpacity={0.9 - i * 0.2}
              fill="#A3E635"
              fillOpacity={0.04}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut", delay: i * 0.2 }}
            />
            <motion.circle
              cx={cx} cy={20} r={3}
              fill="#A3E635"
              fillOpacity={1 - i * 0.15}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ transformOrigin: `${cx}px 20px` }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.8 + i * 0.12 }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
}

// ============================================================================
// IllustrationOrbit — S8 LoadingRoutine
// Órbitas representando hábitos sendo adicionados à sua rotina.
// Substitui o pulse circles existente.
// ============================================================================

export function IllustrationOrbit() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center mb-10"
      aria-hidden
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Static orbit rings */}
        <circle cx="60" cy="60" r="20" stroke="#A3E635" strokeOpacity={0.12} strokeWidth={1} />
        <circle cx="60" cy="60" r="34" stroke="#A3E635" strokeOpacity={0.10} strokeWidth={1} />
        <circle cx="60" cy="60" r="50" stroke="#A3E635" strokeOpacity={0.07} strokeWidth={1} />

        {/* Center glow */}
        <circle cx="60" cy="60" r="10" fill="#A3E635" fillOpacity={0.15} />
        <circle cx="60" cy="60" r="6" fill="#A3E635" />

        {/* Orbiting dots — hidden when reduced motion is preferred */}
        {!shouldReduceMotion && (
          <>
            {/* Orbiting dot 1 — inner orbit, fast (radius=20, starting at right) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: 3, ease: "linear" }}
              style={{ transformOrigin: "60px 60px" }}
            >
              <circle cx={80} cy={60} r={4} fill="#A3E635" />
            </motion.g>

            {/* Orbiting dot 2 — middle orbit, counter-clockwise (radius=34) */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 5.5, repeat: 3, ease: "linear" }}
              style={{ transformOrigin: "60px 60px" }}
            >
              <circle cx={94} cy={60} r={3} fill="#A3E635" fillOpacity={0.75} />
            </motion.g>

            {/* Orbiting dot 3 — outer orbit, slow (radius=50) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: 3, ease: "linear", delay: 1 }}
              style={{ transformOrigin: "60px 60px" }}
            >
              <circle cx={110} cy={60} r={2.5} fill="#A3E635" fillOpacity={0.55} />
            </motion.g>

            {/* Orbiting dot 4 — outer orbit, offset counter-clockwise */}
            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 11, repeat: 3, ease: "linear", delay: 3 }}
              style={{ transformOrigin: "60px 60px" }}
            >
              <circle cx={110} cy={60} r={2} fill="#84cc16" fillOpacity={0.4} />
            </motion.g>
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ============================================================================
// IllustrationLevels — S11 JourneysIntro
// Barras crescentes representando evolução/nivelamento.
// ============================================================================

export function IllustrationLevels() {
  const bars = [
    { width: "28%", opacity: 0.25, delay: 0 },
    { width: "46%", opacity: 0.40, delay: 0.08 },
    { width: "64%", opacity: 0.60, delay: 0.16 },
    { width: "82%", opacity: 0.80, delay: 0.24 },
    { width: "100%", opacity: 1.0,  delay: 0.32 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[160px] mx-auto mb-6 space-y-1.5"
      aria-hidden
    >
      {bars.map((bar, i) => (
        <div key={i} className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ opacity: bar.opacity }}
            initial={{ width: "0%" }}
            animate={{ width: bar.width }}
            transition={{ duration: 0.7, delay: bar.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// IllustrationSparkles — S20 Celebration
// Estrelas que explodem ao redor do check circle ao montar.
// Deve ser renderizado dentro de um wrapper com position: relative.
// ============================================================================

const SPARKLE_CONFIGS = [
  { angle: 0,   radius: 68, size: 9,  color: "#A3E635", delay: 0.05 },
  { angle: 45,  radius: 64, size: 6,  color: "#F59E0B", delay: 0.12 },
  { angle: 90,  radius: 68, size: 10, color: "#A3E635", delay: 0.02 },
  { angle: 135, radius: 62, size: 6,  color: "#F59E0B", delay: 0.18 },
  { angle: 180, radius: 68, size: 9,  color: "#A3E635", delay: 0.08 },
  { angle: 225, radius: 64, size: 5,  color: "#84cc16", delay: 0.15 },
  { angle: 270, radius: 68, size: 9,  color: "#A3E635", delay: 0.03 },
  { angle: 315, radius: 62, size: 6,  color: "#F59E0B", delay: 0.20 },
];

function Sparkle({
  angle,
  radius,
  size,
  color,
  delay,
}: {
  angle: number;
  radius: number;
  size: number;
  color: string;
  delay: number;
}) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * radius;
  const ty = Math.sin(rad) * radius;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -(size / 2),
        marginTop: -(size / 2),
        pointerEvents: "none",
      }}
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], x: tx, y: ty }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        <path
          d="M6 0.5 L7 4.5 L11 6 L7 7.5 L6 11.5 L5 7.5 L1 6 L5 4.5 Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}

export function IllustrationSparkles() {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      {SPARKLE_CONFIGS.map((sp, i) => (
        <Sparkle key={i} {...sp} />
      ))}
    </div>
  );
}

// ============================================================================
// IllustrationBell — S14b ReminderOffset
// Sino que se desenha via pathLength, ondas de notificação pulsam do topo,
// ponto azul (Phase 4) aparece em spring, sino balança em idle loop.
// ============================================================================

export function IllustrationBell() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 22 }}
      className="flex items-center justify-center mb-6"
      aria-hidden
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Ripple arcs — emanam do topo do sino */}
        <motion.path
          d="M 50 20 Q 60 10 70 20"
          stroke="#A3E635" strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, strokeOpacity: 0 }}
          animate={{ pathLength: 1, strokeOpacity: 0.5 }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
        />
        <motion.path
          d="M 44 16 Q 60 2 76 16"
          stroke="#A3E635" strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, strokeOpacity: 0 }}
          animate={{ pathLength: 1, strokeOpacity: 0.35 }}
          transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
        />
        <motion.path
          d="M 38 12 Q 60 -6 82 12"
          stroke="#A3E635" strokeWidth="1.5" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, strokeOpacity: 0 }}
          animate={{ pathLength: 1, strokeOpacity: 0.2 }}
          transition={{ duration: 0.5, delay: 1.6, ease: "easeOut" }}
        />

        {/* Bell group — rocks in idle when not reduced motion */}
        <motion.g
          style={{ transformOrigin: "60px 80px" }}
          animate={shouldReduceMotion ? {} : { rotate: [0, 7, 0, -7, 0] }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: 3, repeatDelay: 1.5, delay: 2 }}
        >
          {/* Bell crown/hanger */}
          <motion.path
            d="M 57 28 Q 57 22 60 22 Q 63 22 63 28"
            stroke="#A3E635" strokeWidth="2.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.6, ease: "easeInOut" }}
          />
          {/* Bell body */}
          <motion.path
            d="M 60 28 C 44 28, 34 42, 34 58 L 34 78 L 86 78 L 86 58 C 86 42, 76 28, 60 28 Z"
            stroke="#A3E635" strokeWidth="2.5" strokeLinejoin="round"
            fill="#A3E635" fillOpacity={0.12}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeInOut" }}
          />
          {/* Bell clapper */}
          <motion.path
            d="M 52 78 Q 52 88 60 88 Q 68 88 68 78"
            stroke="#A3E635" strokeWidth="2.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.85, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Notification badge — blue circle with "1" */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ transformOrigin: "84px 34px" }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.9 }}
        >
          <circle cx={84} cy={34} r={9} fill="#3B82F6" />
          <text
            x={84} y={34}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="11"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >1</text>
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ============================================================================
// IllustrationCheckmark — S14 success & S20 Celebration
// Círculo verde com spring + checkmark SVG que se desenha via pathLength.
// Wrapper autossuficiente w-20 h-20 — não precisa de motion.div externo.
// ============================================================================

export function IllustrationCheckmark() {
  return (
    <div className="relative w-20 h-20">
      {/* Circle springs in */}
      <motion.div
        className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      />
      {/* Checkmark draws itself after circle appears */}
      <svg
        className="absolute inset-0 w-20 h-20"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden
      >
        <motion.path
          d="M 22 42 L 34 54 L 58 28"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.35, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
