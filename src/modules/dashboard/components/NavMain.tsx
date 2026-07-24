"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavGroupSection } from "@/modules/dashboard/components/NavGroupSection"
import { NavMenuItems } from "@/modules/dashboard/components/NavMenuItems"
import type { NavConfig } from "@/modules/dashboard/constants/nav"

type NavMainProps = {
  primary: NavConfig["primary"]
  groups: NavConfig["groups"]
}

export function NavMain({ primary, groups }: NavMainProps) {
  return (
    <>
      {primary.length > 0 ? (
        <SidebarGroup>
          <SidebarGroupContent>
            <NavMenuItems items={primary} />
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}

      {groups.map((group) => (
        <NavGroupSection key={group.id} group={group} />
      ))}
    </>
  )
}
