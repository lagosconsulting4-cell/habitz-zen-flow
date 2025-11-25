import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Volume2, Play, Pause, Loader2 } from "lucide-react";
import useMeditations, { MeditationSession } from "@/hooks/useMeditations";
import { isBonusEnabled } from "@/config/bonusFlags";

const Meditation = () => {
  const navigate = useNavigate();
  const { sessions, isLoading, loadingAudioId, getSignedUrl } = useMeditations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = useMemo(() => {
    const entries = new Map<string, string>();
    sessions.forEach((session) => {
      entries.set(session.category, session.category_label ?? session.category);
    });

    return [
      { value: "all", label: "Todos" },
      ...Array.from(entries.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (selectedCategory === "all") {
      return sessions;
    }
    return sessions.filter((session) => session.category === selectedCategory);
  }, [sessions, selectedCategory]);

  useEffect(() => {
    if (!isBonusEnabled("meditation")) {
      navigate("/bonus", { replace: true });
    }
  }, [navigate]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlayEvent = () => setIsPlaying(true);
    const handlePauseEvent = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);
    audio.addEventListener("ended", handlePauseEvent);

    return () => {
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
      audio.removeEventListener("ended", handlePauseEvent);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.load();
      void audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [audioSrc]);

  const toggleSessionDetails = (sessionId: string) => {
    setSelectedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  const handlePlay = async (session: MeditationSession) => {
    setSelectedSessionId(session.id);

    if (activeSessionId === session.id) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        void audio.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    const signedUrl = await getSignedUrl(session);
    if (!signedUrl) {
      return;
    }

    const audio = audioRef.current;
    if (audio && audioSrc === signedUrl) {
      setActiveSessionId(session.id);
      audio.currentTime = 0;
      void audio.play().catch(() => setIsPlaying(false));
      return;
    }

    setActiveSessionId(session.id);
    setAudioSrc(signedUrl);
  };

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            Meditação &amp; Respiração
          </h1>
          <p className="text-muted-foreground">
            Técnicas práticas para controle mental e foco
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedCategory === category.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary border border-border text-foreground hover:bg-muted"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Card className="rounded-2xl bg-card border border-border p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        ) : filteredSessions.length === 0 ? (
          <Card className="rounded-2xl bg-card border border-border p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma sessão disponível</h2>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros ou volte mais tarde para novas sessões.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer ${
                    selectedSessionId === session.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleSessionDetails(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{session.title}</h3>
                          {session.focus && (
                            <p className="text-sm text-muted-foreground">{session.focus}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{session.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{session.duration_label}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                          {session.category_label}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      className="bg-secondary border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handlePlay(session);
                      }}
                    >
                      {loadingAudioId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : activeSessionId === session.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                {selectedSessionId === session.id && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Passos:</h4>
                        <ol className="space-y-2">
                          {session.steps.map((step, stepIndex) => (
                            <li
                              key={`${session.id}-step-${stepIndex}`}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                {stepIndex + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Sons ambiente
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {session.ambient_sounds.map((sound, soundIndex) => (
                            <Badge key={`${session.id}-sound-${soundIndex}`} className="bg-muted text-muted-foreground border-border text-xs font-semibold">
                              {sound}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-300"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handlePlay(session);
                          }}
                        >
                          {loadingAudioId === session.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : activeSessionId === session.id && isPlaying ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {activeSessionId === session.id && isPlaying ? "Pausar" : "Iniciar sessão"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {activeSession && audioSrc && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 px-4 md:static md:mt-10 md:px-0">
          <Card className="rounded-2xl bg-card border border-border mx-auto flex max-w-3xl flex-col gap-3 p-4 pointer-events-auto md:flex-row md:items-center md:gap-4">
            <div className="md:w-1/3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Reproduzindo agora</p>
              <p className="text-sm font-semibold text-foreground">{activeSession.title}</p>
            </div>
            <div className="flex-1">
              <audio
                ref={audioRef}
                src={audioSrc ?? undefined}
                controls
                autoPlay
                className="w-full"
              />
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                if (audio.paused) {
                  void audio.play().catch(() => setIsPlaying(false));
                } else {
                  audio.pause();
                }
              }}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pausar" : "Reproduzir"}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Meditation;
