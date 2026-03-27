import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Play, Pause, Loader2, X, SkipBack, SkipForward, ChevronUp, Mountain } from "lucide-react";
import useMeditations, { MeditationSession } from "@/hooks/useMeditations";
import { isBonusEnabled } from "@/config/bonusFlags";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

// Cover images — cycle through for sessions without cover_image_url
const COVER_IMAGES = [
  `${import.meta.env.BASE_URL}images/meditation/mountains.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/stones.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/forest.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/zen-garden.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/sunset-sky.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/golden-field.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/night-sky.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/ocean-waves.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/deep-forest.jpg`,
  `${import.meta.env.BASE_URL}images/meditation/snow-mountain.jpg`,
];

function getCoverImage(session: MeditationSession, index: number): string {
  return session.cover_image_url || COVER_IMAGES[index % COVER_IMAGES.length];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const Meditation = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { sessions, isLoading, loadingAudioId, getSignedUrl } = useMeditations();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = useMemo(() => {
    const entries = new Map<string, string>();
    sessions.forEach((s) => entries.set(s.category, s.category_label ?? s.category));
    return [
      { value: "all", label: "Todos" },
      ...Array.from(entries.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (selectedCategory === "all") return sessions;
    return sessions.filter((s) => s.category === selectedCategory);
  }, [sessions, selectedCategory]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  useEffect(() => {
    if (!isBonusEnabled("meditation")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setShowPlayer(false); };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.load();
      void audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [audioSrc]);

  const handlePlay = useCallback(async (session: MeditationSession) => {
    if (activeSessionId === session.id) {
      setShowPlayer(true);
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) audio.pause();
      else void audio.play().catch(() => setIsPlaying(false));
      return;
    }

    const signedUrl = await getSignedUrl(session);
    if (!signedUrl) return;

    setActiveSessionId(session.id);
    setAudioSrc(signedUrl);
    setShowPlayer(true);
    setCurrentTime(0);
  }, [activeSessionId, isPlaying, getSignedUrl]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else void audio.play().catch(() => setIsPlaying(false));
  }, [isPlaying]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setShowPlayer(false);
    setIsPlaying(false);
    setActiveSessionId(null);
    setAudioSrc(null);
    setExpandedInfo(false);
  }, []);

  const skipToSession = useCallback(async (direction: -1 | 1) => {
    if (!activeSession) return;
    const list = filteredSessions.length > 0 ? filteredSessions : sessions;
    const idx = list.findIndex((s) => s.id === activeSession.id);
    if (idx < 0) return;
    const nextIdx = (idx + direction + list.length) % list.length;
    const next = list[nextIdx];
    if (!next) return;
    const signedUrl = await getSignedUrl(next);
    if (!signedUrl) return;
    setActiveSessionId(next.id);
    setAudioSrc(signedUrl);
    setCurrentTime(0);
    setExpandedInfo(false);
  }, [activeSession, filteredSessions, sessions, getSignedUrl]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration - currentTime;

  // Timer ring SVG
  const ringSize = 220;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const activeIndex = activeSession ? sessions.indexOf(activeSession) : 0;
  const activeCover = activeSession ? getCoverImage(activeSession, activeIndex) : COVER_IMAGES[0];

  return (
    <div className="min-h-screen bg-background pb-navbar">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 max-w-xl mx-auto w-full"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className={cn("p-1.5 rounded-full", isDark ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-600")}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="mb-6">
          <h1 className={cn("text-3xl font-extrabold uppercase leading-tight tracking-tight", isDark ? "text-white" : "text-foreground")}>
            Meditação{" "}
            <span className="italic text-[#A3E635]">e Calma</span>
          </h1>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em] mt-1.5", isDark ? "text-white/40" : "text-gray-400")}>
            Técnicas guiadas para reduzir o estresse e aumentar seu foco
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat.value
                  ? isDark ? "bg-white/10 text-white border border-white/15" : "bg-foreground text-background"
                  : isDark ? "text-white/40 hover:text-white/60 border border-white/5" : "text-muted-foreground hover:text-foreground border border-gray-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Session cards */
          <div className="space-y-4 pb-4">
            {filteredSessions.map((session, i) => {
              const cover = getCoverImage(session, i);
              const isActive = activeSessionId === session.id;
              const isLoadingThis = loadingAudioId === session.id;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handlePlay(session)}
                  className={cn(
                    "rounded-2xl overflow-hidden cursor-pointer relative h-72",
                    isDark ? "border border-white/[0.06]" : "border border-gray-100 shadow-lg"
                  )}
                >
                  {/* Full cover image */}
                  <img src={cover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />

                  {/* Gradient overlay — stronger at bottom for text */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 100%)" }} />

                  {/* Recommended badge */}
                  {i === 0 && (
                    <span className="absolute top-4 left-4 z-10 text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full bg-lime-400/20 text-lime-300 backdrop-blur-sm border border-lime-400/20">
                      Recomendado
                    </span>
                  )}

                  {/* Bottom content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-white/50">
                      <Clock className="w-3 h-3" />
                      <span>{session.duration_label}</span>
                      <span>·</span>
                      <Mountain className="w-3 h-3" />
                      <span>{session.category_label || session.category}</span>
                    </div>
                  </div>

                  {/* Play button — bottom right */}
                  <button
                    className="absolute bottom-5 right-5 z-10 w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center"
                    style={{ boxShadow: "0 4px 20px rgba(163,230,53,0.4), 0 0 40px rgba(163,230,53,0.1)" }}
                    onClick={(e) => { e.stopPropagation(); handlePlay(session); }}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-5 h-5 text-black animate-spin" />
                    ) : isActive && isPlaying ? (
                      <Pause className="w-5 h-5 text-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto">
        {audioSrc && <source src={audioSrc} />}
      </audio>

      {/* Full-screen Player */}
      {showPlayer && activeSession && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Background image */}
            <img src={activeCover} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-4" style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
              <button onClick={closePlayer} className="p-1.5 rounded-full text-white/60 hover:text-white">
                <X size={20} />
              </button>
              <h2 className="text-sm font-bold text-white/80">Meditação</h2>
              <div className="w-8" />
            </div>

            {/* Timer ring area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="-rotate-90">
                  <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="transparent" />
                  <circle
                    cx={ringSize / 2} cy={ringSize / 2} r={radius}
                    stroke="#A3E635" strokeWidth={strokeWidth} fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.3s ease", filter: "drop-shadow(0 0 8px rgba(163,230,53,0.4))" }}
                  />
                </svg>
                {/* Only timer inside ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-5xl font-bold text-white tabular-nums" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                    {formatTime(remaining > 0 ? remaining : currentTime)}
                  </p>
                </div>
              </div>
              {/* Session title below ring */}
              <p className="text-base text-lime-300 mt-3 font-semibold">{activeSession.title}</p>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center justify-center gap-8 mb-6">
              <button onClick={() => skipToSession(-1)} className="p-3 rounded-full text-white/40 hover:text-white/60 active:scale-90 transition-transform">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center"
                style={{ boxShadow: "0 0 30px rgba(163,230,53,0.4), 0 4px 16px rgba(0,0,0,0.3)" }}
              >
                {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black ml-1" />}
              </button>
              <button onClick={() => skipToSession(1)} className="p-3 rounded-full text-white/40 hover:text-white/60 active:scale-90 transition-transform">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom expandable card */}
            <div
              className="relative z-10 mx-4 mb-4 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/10 cursor-pointer transition-all"
              style={{ marginBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
              onClick={() => setExpandedInfo(!expandedInfo)}
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-400/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-lime-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest text-white/40">Focando em</p>
                  <p className="text-sm font-semibold text-white truncate">{activeSession.focus || activeSession.title}</p>
                </div>
                <ChevronUp className={cn("w-4 h-4 text-white/30 transition-transform", expandedInfo && "rotate-180")} />
              </div>
              <AnimatePresence>
                {expandedInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      <p className="text-xs text-white/50 leading-relaxed">
                        {activeSession.description || "Sessão de meditação guiada para ajudar a manter o foco e a calma."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Meditation;
