import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingFeatures() {
  const { features } = LANDING_COPY

  return (
    <section
      id={features.id}
      className="scroll-mt-20 border-t border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_4%,var(--background)),var(--background)_42%)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {features.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {features.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {features.supporting}
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-2">
          {features.items.map((item, index) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 bg-background p-7 sm:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-heading text-sm font-medium tabular-nums text-primary/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium tracking-wide text-primary uppercase">
                  {item.highlight}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
