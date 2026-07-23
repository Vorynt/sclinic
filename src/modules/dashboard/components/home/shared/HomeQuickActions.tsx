import type { Icon } from "@phosphor-icons/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export type HomeQuickAction = {
  label: string
  href: string
  icon: Icon
}

type HomeQuickActionsProps = {
  actions: HomeQuickAction[]
}

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action.href + action.label} variant="outline" size="sm" asChild>
          <Link href={action.href}>
            <action.icon data-icon="inline-start" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
