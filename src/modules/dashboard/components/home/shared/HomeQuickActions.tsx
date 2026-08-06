"use client"

import type { Icon } from "@phosphor-icons/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export type HomeQuickAction = {
  label: string
  icon: Icon
  href?: string
  onClick?: () => void
  /** First primary CTA when true; otherwise secondary surface. */
  primary?: boolean
}

type HomeQuickActionsProps = {
  actions: HomeQuickAction[]
}

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const variant =
          action.primary || (action.primary === undefined && index === 0)
            ? "default"
            : "secondary"
        const icon = <action.icon data-icon="inline-start" />

        if (action.onClick) {
          return (
            <Button
              key={action.label}
              type="button"
              variant={variant}
              size="sm"
              onClick={action.onClick}>
              {icon}
              {action.label}
            </Button>
          )
        }

        if (action.href) {
          return (
            <Button
              key={action.href + action.label}
              variant={variant}
              size="sm"
              asChild>
              <Link href={action.href}>
                {icon}
                {action.label}
              </Link>
            </Button>
          )
        }

        return null
      })}
    </div>
  )
}
