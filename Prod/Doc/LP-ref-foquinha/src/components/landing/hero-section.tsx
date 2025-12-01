import Image from "next/image"
import { CheckCircle2, Flame } from "lucide-react"

import { Card } from "@/components/ui/card"
import { CtaButton } from "@/components/landing/cta-button"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps {
  ctaHref: string
}

export function HeroSection({ ctaHref }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 pb-24 lg:grid-cols-12 lg:px-8">
        <div className="space-y-10 lg:col-span-6">
          <Badge className="rounded-full bg-secondary/15 px-4 py-1 text-secondary">14 dias para virar a chave</Badge>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Foquinha IA —
              <span className="mt-2 block text-slate-700">Transforme a sua vida em 14 dias.</span>
              <span className="mt-2 block text-secondary">Direto no seu WhatsApp.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              Organize seus hábitos, melhore sua alimentação, comece a treinar e tire seus objetivos do papel.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <CtaButton
              href={ctaHref}
              label="QUERO USAR A FOQUINHA"
              className="rounded-full bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            />
          </div>
        </div>

        <div className="lg:col-span-6">
          <Card className="relative flex h-full items-center justify-center overflow-hidden border border-slate-200/70 bg-white shadow-xl">
            <div className="relative w-full max-w-sm px-6 py-10">
              <Image
                src="https://i.ibb.co/S4h0cKw7/hero-e-Voc-envia-um-Oi-no-Whats-App.webp"
                alt="Interface da Foquinha IA no WhatsApp"
                width={600}
                height={1200}
                className="w-full object-contain drop-shadow-2xl"
                priority
              />
              <div className="pointer-events-none absolute -right-4 -top-6 hidden size-20 place-items-center rounded-3xl bg-secondary/10 lg:grid">
                <CheckCircle2 className="size-8 text-secondary" />
              </div>
              <div className="pointer-events-none absolute -left-6 -bottom-8 hidden size-16 place-items-center rounded-2xl bg-amber-100 shadow-lg lg:grid">
                <Flame className="size-8 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
