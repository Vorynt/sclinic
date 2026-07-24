"use client"

import { CaretDownIcon } from "@phosphor-icons/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { NavMenuItems } from "@/modules/dashboard/components/NavMenuItems"
import type { NavGroup } from "@/modules/dashboard/constants/nav"

type NavGroupSectionProps = {
  group: NavGroup
}

export function NavGroupSection({ group }: NavGroupSectionProps) {
  if (group.items.length === 0) return null

  if (!group.collapsible) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <NavMenuItems items={group.items} />
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Collapsible
      asChild
      defaultOpen={group.defaultOpen ?? true}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center">
            {group.label}
            <CaretDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <NavMenuItems items={group.items} />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
