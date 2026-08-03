import { PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={routes.landing}
          className="group inline-flex items-center gap-2.5">
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_40%,transparent),0_8px_20px_-8px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
            <PulseIcon className="size-4" weight="bold" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {LANDING_COPY.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
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

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={routes.login}>{LANDING_COPY.nav.login}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.signUp}>{LANDING_COPY.nav.signUp}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
