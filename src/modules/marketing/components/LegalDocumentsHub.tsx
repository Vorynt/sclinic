import { PulseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { routes } from "@/config/routes";
import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy";
import {
  LEGAL_DOCUMENT_CATEGORIES,
  LEGAL_DOCUMENT_CATEGORY_LABELS,
  LEGAL_DOCUMENTS,
} from "@/modules/marketing/constants/legal-documents";

export function LegalDocumentsHub() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b sticky top-0 z-10 border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={routes.landing}
            className="group inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)] transition-transform duration-300 group-hover:scale-105">
              <PulseIcon
                className="size-3.5"
                weight="bold"
                aria-hidden="true"
              />
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
        <header className="mb-10 flex flex-col gap-3 border-b border-border/60 pb-6">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Documentos legais
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
            Termos, políticas e documentos de governança do sclinic. Textos
            rascunhos com placeholders societários — revisão jurídica
            obrigatória antes de uso produtivo.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {LEGAL_DOCUMENT_CATEGORIES.map((category) => {
            const documents = LEGAL_DOCUMENTS.filter(
              (doc) => doc.category === category,
            );

            return (
              <section key={category} className="flex flex-col gap-4">
                <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {LEGAL_DOCUMENT_CATEGORY_LABELS[category]}
                </h2>
                <ul className="flex flex-col divide-y divide-border/50 rounded-lg border border-border/50">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <Link
                        href={doc.href}
                        className="group flex flex-col gap-1 py-4 px-3 transition-colors hover:bg-muted/30">
                        <span className="font-heading text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
                          {doc.title}
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">
                          {doc.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
