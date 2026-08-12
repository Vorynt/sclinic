import { PulseIcon } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { routes } from "@/config/routes"
import { LegalDocumentBody } from "@/modules/marketing/components/LegalDocumentBody"
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"
import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document"

type LegalDocumentProps = {
  document: LegalDocumentContent
}

export function LegalDocument({ document }: LegalDocumentProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
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
          <Link
            href={routes.landing}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <LegalDocumentBody document={document} />
      </main>
    </div>
  )
}
