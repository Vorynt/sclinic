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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="font-heading text-sm font-medium text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
