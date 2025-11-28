import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

const pillars = [
  {
    title: "Leveza",
    subtitle: "Sem fórmulas prontas",
    accentClass: "bg-emerald-200",
    hoverTextClass: "group-hover:text-emerald-600",
  },
  {
    title: "Praticidade",
    subtitle: "Conversa no WhatsApp",
    accentClass: "bg-amber-200",
    hoverTextClass: "group-hover:text-amber-600",
  },
  {
    title: "Planejamento",
    subtitle: "Inteligente e adaptável",
    accentClass: "bg-slate-900",
    hoverTextClass: "group-hover:text-slate-900",
  },
] as const

export function ContextSection() {
  return (
    <section className="mx-6 mt-12 mb-24 rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:mx-8">
      <div className="px-6 py-16 md:px-10 lg:px-14">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl lg:font-bold lg:text-secondary">
            Você não precisa fazer tudo sozinho.
          </h2>
          <h3 className="mt-4 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            A Foquinha IA foi criada pra te ajudar com isso.
          </h3>
          <p className="mt-6 text-lg text-muted-foreground">
            Com leveza, praticidade e planejamento inteligente, ela te apoia na criação de uma rotina realista, personalizada e possível.
          </p>
        </div>

        <Card className="group overflow-hidden border-0 bg-gradient-to-r from-slate-50 to-slate-100 shadow-none">
          <CardContent className="grid gap-8 p-8 text-center sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03]"
              >
                <h4
                  className={cn(
                    "text-3xl font-bold text-foreground transition-colors duration-300 md:text-4xl",
                    pillar.hoverTextClass,
                  )}
                >
                  {pillar.title}
                </h4>
                <p
                  className={cn(
                    "mt-2 text-sm text-muted-foreground transition-colors duration-300",
                    pillar.hoverTextClass,
                  )}
                >
                  {pillar.subtitle}
                </p>
                <div
                  className={cn(
                    "mx-auto mt-4 h-1 w-12 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100",
                    pillar.accentClass,
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
