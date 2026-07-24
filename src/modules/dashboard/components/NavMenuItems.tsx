"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/modules/dashboard/constants/nav"

function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

type NavMenuItemsProps = {
  items: NavItem[]
}

export function NavMenuItems({ items }: NavMenuItemsProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = isNavActive(pathname, item.href)
        const visibleChildren = item.children?.filter(Boolean) ?? []

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>

            {visibleChildren.length > 0 ? (
              <SidebarMenuSub>
                {visibleChildren.map((child) => {
                  const ChildIcon = child.icon
                  return (
                    <SidebarMenuSubItem key={child.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isNavActive(pathname, child.href)}
                      >
                        <Link href={child.href}>
                          <ChildIcon />
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
