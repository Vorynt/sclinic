import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingBenefits() {
  const { benefits } = LANDING_COPY

  return (
    <section
      id={benefits.id}
      className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="max-w-md lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              {benefits.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
              {benefits.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {benefits.supporting}
            </p>
          </div>

          <ol className="flex flex-col divide-y divide-border/70 border-y border-border/70">
            {benefits.items.map((item, index) => (
              <li
                key={item.id}
                className="grid gap-3 py-8 first:pt-6 last:pb-6 sm:grid-cols-[4rem_1fr] sm:gap-6">
                <span className="font-heading text-sm font-medium tabular-nums text-primary/75">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
