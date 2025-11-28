import Link from "next/link"
import Image from "next/image"

import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-2xl bg-secondary/10 p-1">
              <Image
                alt="Foquinha IA"
                src="https://i.ibb.co/Kzr3VMvx/foquiai-logo.png"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">Foquinha IA</h3>
          </div>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Transforme a sua vida em 14 dias. Tudo isso com ajuda da Foquinha direto no seu WhatsApp.
          </p>
        </div>

        <Separator className="mx-auto my-12 max-w-4xl bg-slate-200" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>© 2025 Foquinha IA</p>
          <div className="flex items-center gap-6">
            <Link href="/termos" className="transition-colors hover:text-foreground">
              Termos
            </Link>
            <Link href="/termos" className="transition-colors hover:text-foreground">
              Privacidade
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
