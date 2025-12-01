import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CalendarCheck, Dumbbell, Sparkles, TrendingUp, Utensils } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Você envia um \"Oi\" no WhatsApp",
    description: "Início rápido, sem burocracia.",
    image: "https://i.ibb.co/S4h0cKw7/hero-e-Voc-envia-um-Oi-no-Whats-App.webp",
  },
  {
    number: "2",
    title: "A Foquinha entende você",
    description: "Hábitos, metas e estilo de vida.",
    image: "https://i.ibb.co/ccvrJvbP/foquinha-entende-voce.webp",
  },
  {
    number: "3",
    title: "Plano personalizado",
    description: "Roteiro claro e possível para seguir.",
    image: "https://i.ibb.co/9kdmVsMs/Plano-personalizado.webp",
  },
  {
    number: "4",
    title: "Lembretes e tarefas diárias",
    description: "Orientações pontuais para manter o ritmo.",
    image: "https://i.ibb.co/RpxYdP13/Lembretes-e-tarefas-di-rias.webp",
  },
  {
    number: "5",
    title: "Reorganiza quando preciso",
    description: "Adaptação quando a rotina muda.",
    image: "https://i.ibb.co/ZRKFpdV9/Reorganiza-quando-preciso.webp",
  },
  {
    number: "6",
    title: "Relatório semanal",
    description: "Progresso semanal e mensal no seu WhatsApp.",
    image: "https://i.ibb.co/RTrL3N3m/Relatorio.webp",
  },
] as const

const outcomes = [
  {
    icon: Sparkles,
    title: "Clareza no dia a dia",
    description: "Rotina com foco no que importa e sem ruído mental.",
  },
  {
    icon: CalendarCheck,
    title: "Rotina leve e organizada",
    description: "Agenda que encaixa na sua semana – sem sobrecarregar.",
  },
  {
    icon: Utensils,
    title: "Alimentação equilibrada",
    description: "Sugestões acessíveis e possíveis para cada refeição.",
  },
  {
    icon: Dumbbell,
    title: "Treinos que cabem na sua realidade",
    description: "Planos rápidos, adaptados ao tempo e espaço que você tem.",
  },
  {
    icon: TrendingUp,
    title: "Evolução sem estresse",
    description: "Check-ins semanais mostrando progresso real sem pressão.",
  },
] as const

export function HowItWorksSection() {
  const StepCard = ({
    step,
  }: {
    step: (typeof steps)[number]
  }) => (
    <Card className="h-full border-0 bg-white/90 shadow-lg shadow-secondary/5 ring-1 ring-slate-200/60 transition-transform hover:-translate-y-1">
      <CardContent className="flex h-full flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <span className="text-2xl font-semibold">{step.number}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
        <div className="relative mt-auto overflow-hidden rounded-3xl bg-white">
          <Image
            src={step.image}
            alt={`Interface Foquinha - passo ${step.number}`}
            width={360}
            height={720}
            className="w-full object-contain drop-shadow-xl"
          />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section id="funciona" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            📅 Como funciona?
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">Direto no WhatsApp, simples e prático.</p>
        </div>

        <div className="hidden gap-8 lg:grid lg:grid-cols-3">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>

        <div className="lg:hidden">
          <Carousel
            opts={{ align: "start", loop: false }}
            className="relative w-full"
          >
            <CarouselContent>
              {steps.map((step) => (
                <CarouselItem key={step.number} className="basis-[85%] pl-4">
                  <StepCard step={step} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 top-1/2 hidden translate-y-1/2 rounded-full bg-white shadow-lg sm:flex" />
            <CarouselNext className="-right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white shadow-lg sm:flex" />
          </Carousel>
        </div>

        <div className="mx-auto mt-20 max-w-5xl">
          <div className="text-center">
            <Badge className="mx-auto w-fit rounded-full bg-secondary/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
              🌱 em 14 dias
            </Badge>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Você começa a sentir resultados de verdade
            </h3>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Pequenas vitórias semanais que mostram que a Foquinha está funcionando.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {outcomes.map((outcome) => (
              <Card
                key={outcome.title}
                className="group h-full border-0 bg-white/90 shadow-sm ring-1 ring-slate-200/60 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="flex h-full flex-col gap-4 rounded-[1.25rem] bg-gradient-to-br from-white via-white to-secondary/10 p-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-secondary/15 text-secondary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                      <outcome.icon className="size-5" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground">
                      {outcome.title}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {outcome.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
