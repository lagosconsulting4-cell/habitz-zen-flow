import { Anchor, Sparkles, Zap } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/landing/cta-button"

const testimonials = [
  {
    name: "Ana",
    age: "31 anos",
    quote:
      "Nunca consegui seguir um planner. A Foquinha foi a primeira que entendeu meu ritmo. Me sinto mais leve e focada.",
    highlight: "Leveza e foco",
    icon: Sparkles,
    image: "https://i.ibb.co/wF2zkBZt/julia-psicologa.webp",
  },
  {
    name: "Júlia",
    age: "28 anos",
    quote:
      "A Foquinha ajusta meus horários conforme a semana. Consigo treinar, comer bem e ainda descansar sem culpa.",
    highlight: "Rotina real",
    icon: Anchor,
    image: "https://i.ibb.co/b5nSxRWm/mariana-designer.webp",
  },
  {
    name: "Luan",
    age: "22 anos",
    quote: "Em poucas semanas, minha rotina ficou mais organizada e menos pesada.",
    highlight: "Mudança rápida e leve",
    icon: Zap,
    image: "https://i.ibb.co/spy6CscW/Luan-estudante.webp",
  },
] as const

interface TestimonialsSectionProps {
  ctaHref: string
}

export function TestimonialsSection({ ctaHref }: TestimonialsSectionProps) {
  return (
    <section id="depoimentos" className="mx-6 mt-12 mb-24 rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:mx-8">
      <div className="px-6 py-16 md:px-10 lg:px-14">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Quem já usa, aprova:
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="border border-transparent bg-slate-50 transition-all hover:-translate-y-1 hover:border-secondary/40 hover:bg-white hover:shadow-lg"
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.age}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">“{testimonial.quote}”</p>
                <div className="flex items-center gap-2 text-secondary">
                  <testimonial.icon className="size-4" />
                  <span className="text-sm font-medium">{testimonial.highlight}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <CtaButton
            href={ctaHref}
            label="COMEÇAR AGORA"
            className="mx-auto inline-flex rounded-full bg-primary px-10 py-4 text-sm font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          />
        </div>
      </div>
    </section>
  )
}
