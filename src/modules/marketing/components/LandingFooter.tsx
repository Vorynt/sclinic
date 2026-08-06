import { PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-[linear-gradient(180deg,transparent,color-mix(in_oklch,var(--primary)_3%,var(--background)))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex max-w-sm flex-col gap-3">
          <Link
            href={routes.landing}
            className="group inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
              <PulseIcon className="size-3.5" weight="bold" aria-hidden="true" />
            </span>
            <span className="font-heading text-base font-semibold tracking-tight">
              {LANDING_COPY.brand}
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {LANDING_COPY.footer.tagline}
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <nav className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
            <a
              href={`#${LANDING_COPY.benefits.id}`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
              {LANDING_COPY.nav.benefits}
            </a>
            <a
              href={`#${LANDING_COPY.features.id}`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
              {LANDING_COPY.nav.features}
            </a>
            <a
              href={`#${LANDING_COPY.showcase.id}`}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
              {LANDING_COPY.nav.product}
            </a>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={routes.login}
              className="text-muted-foreground transition-colors hover:text-foreground">
              {LANDING_COPY.nav.login}
            </Link>
            <Link
              href={routes.signUp}
              className="font-medium text-primary transition-colors hover:text-primary/80">
              {LANDING_COPY.nav.signUp}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-muted/25">
        <div className="flex items-center justify-center gap-3 px-6 py-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TextShimmer className="text-sm font-medium">Feito com</TextShimmer>
            <span aria-hidden="true">💙</span>
            <TextShimmer className="text-sm font-medium">by Vorynt</TextShimmer>
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  )
}
