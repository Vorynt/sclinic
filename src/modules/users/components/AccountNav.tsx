"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { ACCOUNT_NAV_ITEMS } from "@/modules/users/constants/account-nav"

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Seções da conta"
      className="sticky top-8 flex flex-col gap-1"
    >
      {ACCOUNT_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
