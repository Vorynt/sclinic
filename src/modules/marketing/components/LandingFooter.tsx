import { PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex max-w-sm flex-col gap-3">
          <Link
            href={routes.landing}
            className="inline-flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
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

        <div className="flex flex-col gap-4 sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href={`#${LANDING_COPY.benefits.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground">
              {LANDING_COPY.nav.benefits}
            </a>
            <a
              href={`#${LANDING_COPY.features.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground">
              {LANDING_COPY.nav.features}
            </a>
            <a
              href={`#${LANDING_COPY.showcase.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground">
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
              className="font-medium text-foreground transition-colors hover:text-primary">
              {LANDING_COPY.nav.signUp}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-muted/20">
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
