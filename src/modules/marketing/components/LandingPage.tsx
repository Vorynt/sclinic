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
    <div className="relative min-h-svh overflow-x-clip bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_140%_80%_at_50%_-15%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_55%,color-mix(in_oklch,var(--chart-3)_8%,transparent),transparent_42%)]" />
        <div className="animate-auth-orb absolute -top-36 left-[8%] size-112 rounded-full bg-primary/14 blur-3xl" />
        <div className="animate-auth-orb-alt absolute top-[22%] -right-28 size-120 rounded-full bg-chart-2/18 blur-3xl" />
        <div className="animate-auth-orb absolute top-[62%] left-[38%] size-80 rounded-full bg-chart-3/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--primary) 16%, transparent) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 28%, transparent 62%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[70vh] opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)",
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
