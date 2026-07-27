"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { SETTINGS_NAV_ITEMS } from "@/modules/settings/constants/nav"
import { USERS_CONSTANTS } from "@/modules/users/constants/users"
import { useAuth } from "@/providers/AuthProvider"

export function SettingsNav() {
  const pathname = usePathname()
  const { auth, can } = useAuth()
  const isOwner =
    auth?.membership?.roleKey === USERS_CONSTANTS.OWNER_ROLE_KEY

  const items = SETTINGS_NAV_ITEMS.filter((item) => {
    if (item.requiresOwner && !isOwner) return false
    if (item.permission && !can(item.permission)) return false
    return true
  })

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
