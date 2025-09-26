import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useLandingMetrics from "@/hooks/useLandingMetrics";
import HeroPreview from "@/components/landing/hero-preview";
import UnlockedSection from "@/components/landing/unlocked-section";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle,
  Flame,
  Heart,
  Home,
  Menu,
  PlusCircle,
  Repeat,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Como funciona", target: "funciona" },
  { label: "Recursos", target: "recursos" },
  { label: "Depoimentos", target: "depoimentos" },
];

const HERO_COUNTERS = [
  { label: "5K+ usuários ativos", icon: Users },
  { label: "87% concluem a primeira semana", icon: CheckCircle, iconClass: "text-green-500" },
  { label: "+32K hábitos marcados", icon: Flame, iconClass: "text-orange-500" },
];

const HERO_HABITS = [
  { label: "Meditação 10min", status: "done" as const, time: "07:30" },
  { label: "Ler 20 páginas", status: "done" as const, time: "08:15" },
  { label: "Exercitar-se 30min", status: "pending" as const, tag: "Pendente" },
  { label: "Beber 2L de água", status: "scheduled" as const, time: "17:00" },
];

const HERO_STATS = [
  { value: "12", label: "Sequência", icon: Flame, gradient: "from-orange-400 to-red-500" },
  { value: "67%", label: "Hoje", icon: CheckCircle, gradient: "from-green-400 to-emerald-500" },
  { value: "94", label: "Total", icon: Activity, gradient: "from-blue-400 to-purple-500" },
];

const BIG_NUMBERS = [
  { value: "32K+", label: "hábitos marcados", accent: "bg-emerald-200", hover: "group-hover/stat:text-emerald-600" },
  { value: "87%", label: "Completam a primeira semana", accent: "bg-amber-200", hover: "group-hover/stat:text-amber-600" },
  { value: "5K+", label: "usuários ativos diários", accent: "bg-gray-900", hover: "group-hover/stat:text-gray-900" },
];

const ROADMAP_STEPS = [
  {
    title: "Acesse o Habitz pelo link",
    description: "Clique no botão e use direto no navegador. Nada de instalação complicada.",
  },
  {
    title: "Instale como app na tela inicial",
    description: "Após o checkout, siga as instruções para adicionar no celular ou computador.",
  },
  {
    title: "Comece sua jornada",
    description: "Escolha o Modo Guiado ou monte seus próprios hábitos. Simples e sem distração.",
  },
];

const TESTIMONIALS = [
  {
    name: "Regina Afonso",
    role: "Designer, 26 anos",
    quote: "Depois de 3 dias usando o Habitz já estava acordando melhor e parando de enrolar. Simples, mas eficaz.",
    highlight: "3 dias para sentir diferença",
    icon: TrendingUp,
    accent: "emerald",
    avatar: "https://i.ibb.co/b5nSxRWm/mariana-designer.webp",
  },
  {
    name: "Felipe Pereira",
    role: "Empreendedor, 34 anos",
    quote: "Achei que seria mais um app... virou parte da minha rotina diária. Impossível não marcar os hábitos.",
    highlight: "Virou rotina automaticamente",
    icon: Repeat,
    accent: "sky",
    avatar: "https://i.ibb.co/RkWBcYRP/felipe-empreendedor-webp.webp",
  },
  {
    name: "Luan Fonatti",
    role: "Estudante, 22 anos",
    quote: "O modo guiado fez mais por mim do que meses de planner. Em 4 semanas virei outra pessoa.",
    highlight: "Mudança em 4 semanas",
    icon: Zap,
    accent: "violet",
    avatar: "https://i.ibb.co/spy6CscW/Luan-estudante.webp",
  },
  {
    name: "Anna Pirelli",
    role: "Advogada, 29 anos",
    quote: "Mantive minha rotina de treino por mais de 2 meses. Antes não passava de 2 semanas.",
    highlight: "2+ meses de consistência",
    icon: CalendarCheck,
    accent: "amber",
    avatar: "https://i.ibb.co/n877s5MG/ana-advogada-webp.webp",
  },
  {
    name: "Aleixo Lima",
    role: "Desenvolvedor, 31 anos",
    quote: "Trabalho remoto e estava perdendo o ritmo. O Habitz reorganizou meu dia sem burocracia.",
    highlight: "Perfeito para home office",
    icon: Home,
    accent: "teal",
    avatar: "https://i.ibb.co/VW6PKZV8/Quando-pensar-virou-trabalho-demais-1.webp",
  },
  {
    name: "Márcia Ferreira",
    role: "Psicóloga, 27 anos",
    quote: "Como Psicóloga, vejo muita coisa complexa. O Habitz é científico, direto e indico para pacientes.",
    highlight: "Indicado por profissional",
    icon: Heart,
    accent: "rose",
    avatar: "https://i.ibb.co/wF2zkBZt/julia-psicologa.webp",
  },
];

const PRICING_FEATURES = [
  "Acesso vitalício ao produto completo",
  "1 ano de Atualizações incluídas",
  "instalação em segundos no navegador",
];

const FOOTER_LINKS = [
  { label: "Termos e Condições", href: "/terms" },
  { label: "Privacidade", href: "#" },
  { label: "Suporte", href: "#" },
];

const CTA_ROUTE = "https://pay.kiwify.com.br/ZkOYIlG";

const accentMap: Record<string, string> = {
  emerald: "group-hover:text-emerald-700",
  sky: "group-hover:text-sky-700",
  violet: "group-hover:text-violet-700",
  amber: "group-hover:text-amber-700",
  teal: "group-hover:text-teal-700",
  rose: "group-hover:text-rose-700",
};

const accentHoverMap: Record<string, string> = {
  emerald: "group-hover:text-emerald-600",
  sky: "group-hover:text-sky-600",
  violet: "group-hover:text-violet-600",
  amber: "group-hover:text-amber-600",
  teal: "group-hover:text-teal-600",
  rose: "group-hover:text-rose-600",
};

const accentShadowMap: Record<string, string> = {
  emerald: "group-hover:shadow-emerald-500/10",
  sky: "group-hover:shadow-sky-500/10",
  violet: "group-hover:shadow-violet-500/10",
  amber: "group-hover:shadow-amber-500/10",
  teal: "group-hover:shadow-teal-500/10",
  rose: "group-hover:shadow-rose-500/10",
};

const cardShadow =
  "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]";
const Index = () => {
  const navigate = useNavigate();
  const track = useLandingMetrics();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".fade-in, .slide-up, .blur-in, .scale-in"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((element) => {
      element.classList.remove("is-visible");
      observer.observe(element);
    });

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, []);

  const handleCta = useCallback(
    (placement: string, action: () => void) => {
      track("cta_click", { placement });
      action();
    },
    [track],
  );

  const handleAnchor = useCallback(
    (target: string, placement: string) => {
      track("nav_click", { placement, target });
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setMobileOpen(false);
    },
    [track],
  );

  const heroCta = () => { window.location.href = CTA_ROUTE; };

  return (
    <div className="overflow-x-hidden bg-white text-gray-900">
      <header className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="relative z-50 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 pt-6">
            <div className="flex items-center gap-3">
              <img src="https://i.ibb.co/9kBTkx0b/Habitz-branco.webp" alt="Habitz" className="h-10 w-10 object-contain" />
              <span className="text-lg font-semibold text-gray-900">Habitz</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.target}
                  onClick={() => handleAnchor(link.target, `nav-${link.target}`)}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  {link.label}
                </button>
              ))}
              <Button
                onClick={() => handleCta("nav-pricing", heroCta)}
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-800"
              >
                Quero Começar
              </Button>
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 md:hidden">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="border-none bg-white/90 backdrop-blur">
                <div className="mt-6 space-y-2">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.target}
                      onClick={() => handleAnchor(link.target, `mobile-${link.target}`)}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      {link.label}
                    </button>
                  ))}
                  <Button
                    className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-gray-800"
                    onClick={() => handleCta("mobile-pricing", heroCta)}
                  >
                    Quero Começar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-6">
              <div className="space-y-6">
                <h1 className="slide-up text-5xl font-bold leading-none tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                  Se organize.
                  <br />
                  <span className="slide-up animate-delay-200 text-gray-700">Evolua.</span>
                  <br />
                  <span className="slide-up animate-delay-300 text-4xl text-gray-500 sm:text-5xl lg:text-6xl">
                    Direto do seu navegador.
                  </span>
                </h1>
                <p className="slide-up animate-delay-400 max-w-xl text-xl font-medium leading-relaxed text-gray-600 sm:text-2xl">
                  Habitz e o aplicativo minimalista que transforma intencao em rotina, e rotina em evolucao.
                </p>
                <p className="slide-up animate-delay-500 text-lg text-gray-500">
                  Sem distracao. Sem coach. Sem plano gratuito. Tudo liberado por R$ 47,90.
                </p>
              </div>

              <div className="slide-up animate-delay-600 flex flex-col items-start gap-4 sm:flex-row">
                <Button
                  onClick={() => handleCta("hero-primary", heroCta)}
                  className="group inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-900 hover:shadow-xl"
                >
                  <CheckCircle className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                  Quero comecar agora
                </Button>
                <div className="flex flex-col text-sm text-gray-500">
                  <span className="font-medium">R$ 47,90 - pagamento unico</span>
                  <span>Acesso vitalicio. Sem mensalidade.</span>
                </div>
              </div>

              <div className="slide-up animate-delay-700 flex flex-wrap items-center gap-6 text-sm text-gray-500">
                {HERO_COUNTERS.map(({ label, icon: Icon, iconClass }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${iconClass ?? "text-gray-600"}`} strokeWidth={1.5} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:col-span-6 lg:block">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-white/90 to-slate-100 shadow-[0_40px_120px_rgba(15,23,42,0.12)]" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
                <HeroPreview onCtaClick={() => handleCta("hero-preview", heroCta)} track={track} />
              </div>
            </div>

            <div className="lg:hidden">
              <HeroPreview onCtaClick={() => handleCta("hero-preview", heroCta)} track={track} />
            </div>
          </div>
        </section>
      </header>

      <main>
        <section className="mx-6 mb-20 mt-8 overflow-hidden rounded-3xl bg-white shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]">
          <div className="pt-16 pb-16 pr-6 pl-6 md:px-10 lg:px-14">
            <div className="fade-in mx-auto mb-16 max-w-3xl text-center">
              <h2 className="text-4xl font-normal tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Números que falam,</h2>
              <h3 className="mb-6 text-4xl font-normal tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Resultados reais</h3>
              <p className="text-lg text-slate-600">Gente comum que decidiu transformar intenção em rotina e viu a vida andar.</p>
            </div>

            <div className="relative rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-8 transition-all duration-700 hover:shadow-2xl hover:shadow-black/10">
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                {BIG_NUMBERS.map((item, index) => (
                  <div
                    key={item.label}
                    className="group/stat transform transition-all duration-500 hover:-translate-y-2 hover:scale-110"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <div className={`text-3xl font-bold text-slate-900 transition-colors duration-300 md:text-4xl ${item.hover}`}>
                      {item.value}
                    </div>
                    <div className="text-sm text-slate-600 transition-colors duration-300 group-hover/stat:text-slate-800">
                      {item.label}
                    </div>
                    <div className={`mx-auto mt-2 h-1 w-12 rounded-full opacity-0 transition-all duration-500 group-hover/stat:opacity-100 ${item.accent}`} />
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-10">
                <div className="absolute left-4 top-4 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                <div className="absolute right-12 top-8 h-1 w-1 animate-ping rounded-full bg-amber-400" style={{ animationDelay: "0.5s" }} />
                <div className="absolute bottom-6 left-8 h-1.5 w-1.5 animate-ping rounded-full bg-gray-400" style={{ animationDelay: "1s" }} />
                <div className="absolute bottom-4 right-4 h-1 w-1 animate-ping rounded-full bg-black" style={{ animationDelay: "1.5s" }} />
              </div>
            </div>
          </div>
        </section>

        <UnlockedSection onCtaClick={() => handleCta("unlock-primary", heroCta)} track={track} />


        <section id="funciona" className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="fade-in mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Como funciona?</h2>
              <p className="text-xl leading-relaxed text-gray-600">
                Sem download. Sem cadastro complicado. Em minutos você está rodando seu plano.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
              {ROADMAP_STEPS.map((step, index) => (
                <div key={step.title} className="slide-up text-center" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <h3 className="mb-4 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="leading-relaxed text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="depoimentos"
          className="mx-6 mb-20 mt-8 overflow-hidden rounded-3xl bg-white shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
        >
          <div className="pt-16 pb-16 pr-6 pl-6 md:px-10 lg:px-14">
            <div className="fade-in mx-auto mb-16 max-w-3xl text-center">
              <h2 className="text-4xl font-normal tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Transformações reais,
              </h2>
              <h3 className="mb-6 text-4xl font-normal tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">Pessoas reais</h3>
              <p className="text-lg text-slate-600">
                O que a comunidade fala sobre sair do piloto automático com o Habitz.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((item, index) => (
                <div
                  key={item.name}
                  className="group relative cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div
                    className={`${cardShadow} h-full rounded-2xl bg-[#f1f5f9] p-6 transition-all duration-500 group-hover:bg-white group-hover:shadow-xl ${accentShadowMap[item.accent]}`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200 transition-transform duration-300 group-hover:scale-110">
                        <img src={item.avatar} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div>
                        <h4 className={`font-semibold text-slate-900 transition-colors duration-300 ${accentMap[item.accent]}`}>
                          {item.name}
                        </h4>
                        <p className="text-sm text-slate-600">{item.role}</p>
                      </div>
                    </div>
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-slate-700 transition-colors duration-300 group-hover:text-slate-800">
                      "{item.quote}"
                    </p>
                    <div
                      className={`flex items-center gap-2 text-neutral-950/50 transition-colors duration-300 ${accentHoverMap[item.accent]}`}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{item.highlight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button
                onClick={() => handleCta("testimonials-cta", heroCta)}
                className="relative inline-flex h-12 w-60 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-black text-sm font-semibold text-white shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/20"
              >
                Quero Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="fade-in mx-auto max-w-4xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Pronto para assumir o controle?
              </h2>
              <span className="mt-4 block text-3xl font-medium text-gray-600 sm:text-4xl lg:text-5xl">
                Uma compra. Acesso total.
              </span>

              <div className="relative mx-auto mt-12 max-w-lg rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow-[0_1px_0_rgba(0,0,0,0.04),_0_12px_30px_rgba(0,0,0,0.06)] sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Acesso vitalício</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                    <Heart className="h-3 w-3" strokeWidth={1.5} /> Oferta única
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">R$ 47,90</span>
                  <span className="text-sm text-gray-500">Pagamento único</span>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-600">
                  Sem mensalidade. Sem bloqueios. App completo desde o primeiro acesso.
                </div>

                <div className="mt-6 border-t border-gray-200" />

                <ul className="mt-6 space-y-3 text-left text-gray-700">
                  {PRICING_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-gray-800" strokeWidth={1.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-gray-200" />

                <div className="mt-6 flex items-start gap-3 text-left">
                  <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-gray-700" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-gray-800">Garantia de 7 dias</p>
                    <p className="text-sm text-gray-600">Teste sem risco. Se não for para você, devolvemos o valor sem perguntas.</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleCta("pricing-primary", heroCta)}
                  className="mt-8 w-full items-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-800"
                >
                  Quero acesso vitalício por R$ 47,90
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white pb-12 pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="fade-in mb-6 flex items-center justify-center gap-3">
              <img src="https://i.ibb.co/9kBTkx0b/Habitz-branco.webp" alt="Habitz" className="h-12 w-12 object-contain" />
              <h3 className="text-2xl font-bold text-gray-900">Habitz</h3>
            </div>
            <p className="fade-in animate-delay-100 mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
              Transforme intenção em rotina, e rotina em evolução. Direto do seu navegador.
            </p>
          </div>

          <div className="fade-in animate-delay-200 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
              <p>© 2024 Habitz. Feito com disciplina para pessoas disciplinadas.</p>
              <div className="flex items-center gap-6">
                {FOOTER_LINKS.map((link) => (
                  <a key={link.label} href={link.href} className="transition-colors hover:text-gray-900">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;














