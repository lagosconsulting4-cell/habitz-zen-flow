import { BarChart3, Dumbbell, MessageCircle, RefreshCcw, Target, Utensils, ListChecks } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    title: "Criar rotinas transformadoras com base nos seus objetivos",
    description: "Planos práticos, sob medida para a sua realidade.",
    icon: Target,
  },
  {
    title: "Montar um plano de treino, mesmo sem academia",
    description: "Exercícios simples e eficientes, de onde você estiver.",
    icon: Dumbbell,
  },
  {
    title: "Comer melhor gastando pouco",
    description: "Sugestões acessíveis, equilibradas e realistas.",
    icon: Utensils,
  },
  {
    title: "Organizar suas tarefas e metas diárias",
    description: "Priorize o que importa com clareza e constância.",
    icon: ListChecks,
  },
  {
    title: "Se adaptar quando a rotina muda",
    description: "Reorganização rápida quando algo sai do controle.",
    icon: RefreshCcw,
  },
  {
    title: "Acompanhar seu progresso com relatórios",
    description: "Relatórios semanais e mensais para ver sua evolução.",
    icon: BarChart3,
  },
  {
    title: "Com conversas simples, diretas e pensadas pra sua realidade",
    description: "Sem fórmulas prontas, sem pressão.",
    icon: MessageCircle,
  },
] as const

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            🤖 O que é a Foquinha?
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Uma assistente de IA que conversa com você no WhatsApp e te ajuda a:
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border border-transparent bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-secondary/40 hover:shadow-lg"
            >
              <CardContent className="flex gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <feature.icon className="size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
