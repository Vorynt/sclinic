"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ClinicIndicator } from "@/modules/dashboard/components/ClinicIndicator"
import { NavMain } from "@/modules/dashboard/components/NavMain"
import { NavSecondary } from "@/modules/dashboard/components/NavSecondary"
import { getVisibleNavConfig } from "@/modules/dashboard/constants/nav"
import { useAuth } from "@/providers/AuthProvider"

export function AppSidebar() {
  const { canAny } = useAuth()
  const { primary, groups, secondary } = getVisibleNavConfig(canAny)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ClinicIndicator />
      </SidebarHeader>

      <SidebarContent>
        <NavMain primary={primary} groups={groups} />
        <NavSecondary items={secondary} className="mt-auto" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
