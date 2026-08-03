import { LANDING_COPY } from "@/modules/marketing/constants/landing-copy"

export function LandingTrust() {
  const { trust } = LANDING_COPY

  return (
    <section
      aria-label="Sinais de confiança"
      className="border-b border-border/50 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {trust.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-primary/70"
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
