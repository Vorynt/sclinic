import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingFeatures() {
  const { features } = LANDING_COPY

  return (
    <section
      id={features.id}
      className="scroll-mt-20 border-t border-border/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            {features.eyebrow}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {features.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {features.items.map((item, index) => (
            <article
              key={item.id}
              className={
                index % 2 === 1 ? "sm:mt-8" : undefined
              }>
              <p className="font-heading text-sm font-medium tabular-nums text-primary/70">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
