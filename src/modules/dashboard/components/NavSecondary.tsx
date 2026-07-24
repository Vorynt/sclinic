"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavMenuItems } from "@/modules/dashboard/components/NavMenuItems"
import type { NavItem } from "@/modules/dashboard/constants/nav"

type NavSecondaryProps = {
  items: NavItem[]
  className?: string
}

export function NavSecondary({ items, className }: NavSecondaryProps) {
  if (items.length === 0) return null

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <NavMenuItems items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
