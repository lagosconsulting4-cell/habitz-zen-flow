import { SiteHeader } from "@/components/landing/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { ContextSection } from "@/components/landing/context-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { SiteFooter } from "@/components/landing/site-footer"

const checkoutBaseUrl =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ?? "https://pay.kiwify.com.br/lzUck6P"

const getCheckoutUrl = (campaign: string) => {
  try {
    const url = new URL(checkoutBaseUrl)
    url.searchParams.set("utm_source", "landing")
    url.searchParams.set("utm_medium", "cta")
    url.searchParams.set("utm_campaign", campaign)
    return url.toString()
  } catch {
    return checkoutBaseUrl
  }
}

export default function Home() {
  const checkoutHero = getCheckoutUrl("hero")
  const checkoutHeader = getCheckoutUrl("header")
  const checkoutTestimonials = getCheckoutUrl("testimonials")
  const checkoutPricingPrimary = getCheckoutUrl("pricing_primary")
  const checkoutPricingSecondary = getCheckoutUrl("pricing_secondary")

  return (
    <div className="bg-background text-foreground">
      <SiteHeader ctaHref={checkoutHeader} ctaLabel="COMEÇAR AGORA" />
      <main className="flex flex-col gap-0">
        <HeroSection ctaHref={checkoutHero} />
        <ContextSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection ctaHref={checkoutTestimonials} />
        <PricingSection
          ctaHref={checkoutPricingPrimary}
          secondaryCtaHref={checkoutPricingSecondary}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
