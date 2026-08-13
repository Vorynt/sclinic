import type { LegalDocumentContent } from "@/modules/marketing/types/legal-document";

type LegalDocumentBodyProps = {
  document: LegalDocumentContent;
  /** Hide the page-level H1 when the title is shown elsewhere (e.g. dialog). */
  hideTitle?: boolean;
};

export function LegalDocumentBody({
  document,
  hideTitle = false,
}: LegalDocumentBodyProps) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 border-b border-border/60 pb-6">
        {hideTitle ? null : (
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {document.title}
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          Última atualização: {document.lastUpdated}
        </p>
        <p className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {document.disclaimer}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {document.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-20 flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={`${section.id}-p-${index}`}
                className="text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
                {section.bullets.map((item, index) => (
                  <li key={`${section.id}-b-${index}`}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.table ? (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full min-w-xl border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40">
                      {section.table.headers.map((header) => (
                        <th
                          key={`${section.id}-h-${header}`}
                          className="px-3 py-2.5 font-heading text-xs font-semibold tracking-tight text-foreground sm:px-4 sm:text-sm">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, rowIndex) => (
                      <tr
                        key={`${section.id}-r-${rowIndex}`}
                        className="border-b border-border/40 last:border-b-0">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${section.id}-r-${rowIndex}-c-${cellIndex}`}
                            className="px-3 py-2.5 align-top text-sm leading-relaxed text-muted-foreground sm:px-4 sm:text-[15px] sm:leading-6">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
