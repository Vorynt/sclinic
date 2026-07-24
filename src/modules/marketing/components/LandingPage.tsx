import { LandingCta } from "@/modules/marketing/components/LandingCta"
import { LandingFeatures } from "@/modules/marketing/components/LandingFeatures"
import { LandingFooter } from "@/modules/marketing/components/LandingFooter"
import { LandingHero } from "@/modules/marketing/components/LandingHero"
import { LandingNav } from "@/modules/marketing/components/LandingNav"
import { LandingShowcase } from "@/modules/marketing/components/LandingShowcase"

export function LandingPage() {
  return (
    <div className="light relative min-h-svh overflow-x-clip bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_11%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_50%)]" />
        <div className="animate-auth-orb absolute -top-28 left-[8%] size-88 rounded-full bg-primary/15 blur-3xl" />
        <div className="animate-auth-orb-alt absolute top-[35%] -right-20 size-104 rounded-full bg-chart-1/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.28] dark:opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingFeatures />
          <LandingShowcase />
          <LandingCta />
        </main>
        <LandingFooter />
      </div>
    </div>
  )
}
