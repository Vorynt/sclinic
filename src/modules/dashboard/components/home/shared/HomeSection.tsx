import type { ReactNode } from "react"

type HomeSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function HomeSection({
  title,
  description,
  action,
  children,
}: HomeSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-heading text-sm font-medium text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
