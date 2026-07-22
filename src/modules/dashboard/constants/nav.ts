import type { Icon } from "@phosphor-icons/react"
import {
  CalendarBlankIcon,
  GearIcon,
  HouseIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"

import type { PermissionKey } from "@/config/permissions"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"

export type NavItem = {
  title: string
  href: string
  icon: Icon
  /** When set, user must have at least one of these permissions. */
  permissions?: PermissionKey[]
  /** Hidden until the module page exists. */
  enabled: boolean
}

export type BreadcrumbSegment = {
  label: string
  href?: string
}

export type PageMeta = {
  title: string
  breadcrumbs: BreadcrumbSegment[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: routes.dashboard,
    icon: HouseIcon,
    enabled: true,
  },
  {
    title: "Equipe",
    href: routes.users,
    icon: UsersThreeIcon,
    permissions: [Permission.MEMBERS_INVITE],
    enabled: true,
  },
  {
    title: "Pacientes",
    href: routes.patients,
    icon: UsersIcon,
    permissions: [Permission.PATIENTS_READ],
    enabled: false,
  },
  {
    title: "Agendamentos",
    href: routes.appointments,
    icon: CalendarBlankIcon,
    permissions: [
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_UPDATE,
    ],
    enabled: false,
  },
  {
    title: "Configurações",
    href: routes.settings,
    icon: GearIcon,
    permissions: [Permission.SETTINGS_MANAGE],
    enabled: false,
  },
]

const PAGE_META: Record<string, PageMeta> = {
  [routes.dashboard]: {
    title: "Dashboard",
    breadcrumbs: [{ label: "Dashboard" }],
  },
  [routes.users]: {
    title: "Equipe",
    breadcrumbs: [
      { label: "Início", href: routes.dashboard },
      { label: "Equipe" },
    ],
  },
  [routes.settings]: {
    title: "Configurações",
    breadcrumbs: [
      { label: "Início", href: routes.dashboard },
      { label: "Configurações" },
    ],
  },
  [routes.patients]: {
    title: "Pacientes",
    breadcrumbs: [
      { label: "Início", href: routes.dashboard },
      { label: "Pacientes" },
    ],
  },
  [routes.appointments]: {
    title: "Agendamentos",
    breadcrumbs: [
      { label: "Início", href: routes.dashboard },
      { label: "Agendamentos" },
    ],
  },
}

const DEFAULT_PAGE_META: PageMeta = {
  title: "sclinic",
  breadcrumbs: [{ label: "Início", href: routes.dashboard }],
}

export function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) {
    return PAGE_META[pathname]
  }

  const match = Object.entries(PAGE_META).find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  )

  return match?.[1] ?? DEFAULT_PAGE_META
}

export function getVisibleNavItems(
  canAny: (...permissions: PermissionKey[]) => boolean,
): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.enabled) return false
    if (!item.permissions || item.permissions.length === 0) return true
    return canAny(...item.permissions)
  })
}
