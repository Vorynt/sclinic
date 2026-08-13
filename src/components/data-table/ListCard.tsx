"use client"

import { CaretDownIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ListCardMetaItem } from "@/types/table"

type ListCardProps = {
  title: ReactNode
  leading?: ReactNode
  badges?: ReactNode
  /** Always-visible dense subtitle (ChargeCard-style skim). */
  preview?: ReactNode
  meta?: ListCardMetaItem[]
  trailing?: ReactNode
  actions?: ReactNode
  /**
   * When true and there are details, meta/children sit in a collapse.
   * Title, preview, trailing and actions stay always visible.
   */
  collapsible?: boolean
  defaultOpen?: boolean
  children?: ReactNode
  className?: string
}

function MetaList({ items }: { items: ListCardMetaItem[] }) {
  if (items.length === 0) return null

  return (
    <dl className="grid gap-1 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-foreground wrap-anywhere">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Dense list row for mobile — mirrors ChargeCard anatomy.
 * Domain owns title/preview/meta/actions; this only provides chrome.
 */
export function ListCard({
  title,
  leading,
  badges,
  preview,
  meta = [],
  trailing,
  actions,
  collapsible = false,
  defaultOpen = false,
  children,
  className,
}: ListCardProps) {
  const details = (
    <>
      {meta.length > 0 ? <MetaList items={meta} /> : null}
      {children}
    </>
  )
  const hasDetails = meta.length > 0 || Boolean(children)
  const showCollapse = collapsible && hasDetails

  const row = (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      {leading ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          {leading}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="min-w-0 truncate text-sm font-medium text-foreground">
            {title}
          </div>
          {badges}
        </div>
        {preview ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {preview}
          </p>
        ) : null}
      </div>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}

      {actions ? <div className="shrink-0">{actions}</div> : null}

      {showCollapse ? (
        <CollapsibleTrigger
          type="button"
          aria-label="Ver detalhes"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <CaretDownIcon
            className={cn(
              "size-4 transition-transform",
              "group-data-[state=open]/list-card:rotate-180",
            )}
            aria-hidden
          />
        </CollapsibleTrigger>
      ) : null}
    </div>
  )

  if (showCollapse) {
    return (
      <Collapsible
        defaultOpen={defaultOpen}
        className={cn(
          "group/list-card rounded-lg border border-border bg-card",
          className,
        )}>
        {row}
        <CollapsibleContent>
          <div className="border-t border-border px-3 py-2">{details}</div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card",
        className,
      )}>
      {row}
      {hasDetails ? (
        <div className="border-t border-border px-3 py-2">{details}</div>
      ) : null}
    </div>
  )
}
