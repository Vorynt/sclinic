"use client"

import { Button } from "@/components/ui/button"
import { useRegisterPageActions } from "@/hooks/use-register-page-actions"
import { cn } from "@/lib/utils"
import type { PageAction } from "@/types/page-action"
import { resolvePageActions } from "@/utils/resolve-page-actions"

type PageHeaderProps = {
  title: string
  description?: string
  /**
   * Declarative page actions. On desktop they render as header buttons;
   * on mobile they surface as the AppShell FAB stack.
   */
  actions?: PageAction[]
  className?: string
  /** Soft entrance on the title — respects prefers-reduced-motion via globals. */
  animateTitle?: boolean
}

/**
 * Standard dashboard page header (title + description + optional actions).
 * Pair with `PageHeaderSkeleton` for loading states.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  animateTitle = true,
}: PageHeaderProps) {
  useRegisterPageActions(actions)

  const { primary, secondary } = resolvePageActions(actions ?? [])

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1
          className={cn(
            "font-heading text-xl font-semibold tracking-tight text-foreground",
            animateTitle && "animate-auth-fade-up",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {primary ? (
        <div className="hidden shrink-0 flex-wrap items-center gap-2 md:flex">
          {secondary.map((action) => (
            <HeaderActionButton
              key={action.id}
              action={action}
              variant="outline"
            />
          ))}
          <HeaderActionButton action={primary} variant="default" />
        </div>
      ) : null}
    </div>
  )
}

function HeaderActionButton({
  action,
  variant,
}: {
  action: PageAction
  variant: "default" | "outline"
}) {
  const Icon = action.icon

  return (
    <Button type="button" variant={variant} onClick={action.onClick}>
      {Icon ? <Icon data-icon="inline-start" /> : null}
      {action.label}
    </Button>
  )
}
