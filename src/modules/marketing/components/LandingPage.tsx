import { LandingBenefits } from "@/modules/marketing/components/LandingBenefits";
import { LandingCta } from "@/modules/marketing/components/LandingCta";
import { LandingFeatures } from "@/modules/marketing/components/LandingFeatures";
import { LandingFooter } from "@/modules/marketing/components/LandingFooter";
import { LandingHero } from "@/modules/marketing/components/LandingHero";
import { LandingNav } from "@/modules/marketing/components/LandingNav";
import { LandingShowcase } from "@/modules/marketing/components/LandingShowcase";
import { LandingTrust } from "@/modules/marketing/components/LandingTrust";

export function LandingPage() {
  return (
    <div className="light relative min-h-svh overflow-x-clip bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_70%_at_50%_-10%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_48%)]" />
        <div className="animate-auth-orb absolute -top-32 left-[12%] size-96 rounded-full bg-primary/12 blur-3xl" />
        <div className="animate-auth-orb-alt absolute top-[28%] -right-24 size-112 rounded-full bg-chart-2/16 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--primary) 14%, transparent) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingTrust />
          <LandingBenefits />
          <LandingFeatures />
          <LandingShowcase />
          <LandingCta />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
