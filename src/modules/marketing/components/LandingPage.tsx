import { LandingBenefits } from "@/modules/marketing/components/LandingBenefits"
import { LandingCta } from "@/modules/marketing/components/LandingCta"
import { LandingFeatures } from "@/modules/marketing/components/LandingFeatures"
import { LandingFooter } from "@/modules/marketing/components/LandingFooter"
import { LandingHero } from "@/modules/marketing/components/LandingHero"
import { LandingNav } from "@/modules/marketing/components/LandingNav"
import { LandingShowcase } from "@/modules/marketing/components/LandingShowcase"
import { LandingMotionProvider } from "@/modules/marketing/components/motion/LandingMotionProvider"

export function LandingPage() {
  return (
    <LandingMotionProvider>
      <div className="relative min-h-svh overflow-x-clip bg-background text-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[72vh] bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,color-mix(in_oklch,var(--primary)_13%,transparent),transparent_72%)]" />
        </div>

        <div className="relative z-10">
          <LandingNav />
          <main>
            <LandingHero />
            <LandingBenefits />
            <LandingFeatures />
            <LandingShowcase />
            <LandingCta />
          </main>
          <LandingFooter />
        </div>
      </div>
    </LandingMotionProvider>
  )
}
