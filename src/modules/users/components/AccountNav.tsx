"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { useHasLivingSubscription } from "@/modules/billing/hooks/use-has-living-subscription"
import { ACCOUNT_NAV_ITEMS } from "@/modules/users/constants/account-nav"

export function AccountNav() {
  const pathname = usePathname()
  const livingQuery = useHasLivingSubscription()
  const hasLivingSubscription = livingQuery.data === true

  const items = ACCOUNT_NAV_ITEMS.filter((item) => {
    if (!item.requiresLivingSubscription) return true
    // Hide until we know — avoids flashing Assinatura for members without a plan.
    if (livingQuery.isPending || livingQuery.isError) return false
    return hasLivingSubscription
  })

  return (
    <nav
      aria-label="Seções da conta"
      className="sticky top-8 flex flex-col gap-1"
    >
      {items.map((item) => {
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
