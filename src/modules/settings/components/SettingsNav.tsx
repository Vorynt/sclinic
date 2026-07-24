"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { SETTINGS_NAV_ITEMS } from "@/modules/settings/constants/nav"
import { useAuth } from "@/providers/AuthProvider"

export function SettingsNav() {
  const pathname = usePathname()
  const { can } = useAuth()

  const items = SETTINGS_NAV_ITEMS.filter(
    (item) => !item.permission || can(item.permission),
  )

  return (
    <nav
      aria-label="Seções de configuração"
      className="sticky top-8 flex flex-col gap-1"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        const isDanger = item.tone === "danger"

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive && !isDanger && "bg-muted font-medium text-foreground",
              isActive &&
                isDanger &&
                "bg-destructive/10 font-medium text-destructive",
              !isActive &&
                !isDanger &&
                "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              !isActive &&
                isDanger &&
                "text-destructive/80 hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
