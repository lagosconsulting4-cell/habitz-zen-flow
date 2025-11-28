"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

import { CtaButton } from "@/components/landing/cta-button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { href: "#funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
  { href: "#depoimentos", label: "Depoimentos" },
]

interface SiteHeaderProps {
  ctaHref: string
  ctaLabel: string
}

export function SiteHeader({ ctaHref, ctaLabel }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 transition-[height] lg:px-8">
        <Link href="#hero" className="flex items-center gap-3" aria-label="Foquinha IA - Início">
          <div className="relative size-12 overflow-hidden rounded-2xl bg-secondary/10 p-1">
            <Image
              alt="Foquinha IA"
              src="https://i.ibb.co/Kzr3VMvx/foquiai-logo.png"
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Foquinha IA
          </span>
        </Link>

        <NavigationMenu className="hidden items-center gap-1 md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-4 md:flex">
          <CtaButton href={ctaHref} label={ctaLabel} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90" />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Foquinha IA</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <CtaButton
                href={ctaHref}
                label={ctaLabel}
                className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
