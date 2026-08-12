import { PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { TextShimmer } from "@/components/ui/text-shimmer"
import { routes } from "@/config/routes"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"
import {
  LEGAL_DOCUMENT_CATEGORIES,
  LEGAL_DOCUMENT_CATEGORY_LABELS,
  LEGAL_DOCUMENTS,
} from "@/modules/marketing/constants/legal-documents"

const linkClassName =
  "text-[15px] leading-snug text-foreground/70 transition-colors hover:text-foreground"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-[linear-gradient(180deg,transparent,color-mix(in_oklch,var(--primary)_3%,var(--background)))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,0.7fr))] lg:gap-12">
          <div className="flex max-w-md flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              href={routes.landing}
              className="group inline-flex w-fit items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
                <PulseIcon
                  className="size-3.5"
                  weight="bold"
                  aria-hidden="true"
                />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                {LANDING_COPY.brand}
              </span>
            </Link>
            <p className="text-[15px] leading-7 text-muted-foreground">
              {LANDING_COPY.footer.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              {LANDING_COPY.footer.productHeading}
            </h2>
            <nav
              aria-label={LANDING_COPY.footer.productHeading}
              className="flex flex-col gap-3">
              <a
                href={`#${LANDING_COPY.benefits.id}`}
                className={linkClassName}>
                {LANDING_COPY.nav.benefits}
              </a>
              <a
                href={`#${LANDING_COPY.features.id}`}
                className={linkClassName}>
                {LANDING_COPY.nav.features}
              </a>
              <a
                href={`#${LANDING_COPY.showcase.id}`}
                className={linkClassName}>
                {LANDING_COPY.nav.product}
              </a>
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              {LANDING_COPY.footer.accountHeading}
            </h2>
            <nav
              aria-label={LANDING_COPY.footer.accountHeading}
              className="flex flex-col gap-3">
              <Link href={routes.login} className={linkClassName}>
                {LANDING_COPY.nav.login}
              </Link>
              <Link
                href={routes.signUp}
                className="text-[15px] font-medium leading-snug text-primary transition-colors hover:text-primary/80">
                {LANDING_COPY.nav.signUp}
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-border/50 pt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <h2 className="font-heading text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">
              {LANDING_COPY.footer.legalHeading}
            </h2>
            <Link
              href={routes.legal}
              className="text-[15px] font-medium text-primary transition-colors hover:text-primary/80">
              {LANDING_COPY.footer.legal}
            </Link>
          </div>

          <nav
            aria-label={LANDING_COPY.footer.legalHeading}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {LEGAL_DOCUMENT_CATEGORIES.map((category) => {
              const documents = LEGAL_DOCUMENTS.filter(
                (doc) => doc.category === category,
              )

              return (
                <div key={category} className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {LEGAL_DOCUMENT_CATEGORY_LABELS[category]}
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        <Link href={doc.href} className={linkClassName}>
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <TextShimmer className="text-sm font-medium">Feito com</TextShimmer>
            <span aria-hidden="true">💙</span>
            <TextShimmer className="text-sm font-medium">by Vorynt</TextShimmer>
          </span>
          <span>© 2026 {LANDING_COPY.brand}</span>
        </div>
      </div>
    </footer>
  )
}
