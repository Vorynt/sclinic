import type { Icon } from "@phosphor-icons/react"
import {
  CalendarBlankIcon,
  GearIcon,
  HouseIcon,
  StethoscopeIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"

import type { PermissionKey } from "@/config/permissions"
import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { hasAnyPermission } from "@/core/permissions"

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
    title: "Início",
    href: routes.home,
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
    enabled: true,
  },
  {
    title: "Profissionais",
    href: routes.professionals,
    icon: StethoscopeIcon,
    permissions: [Permission.PROFESSIONALS_MANAGE],
    enabled: true,
  },
  {
    title: "Agendamentos",
    href: routes.appointments,
    icon: CalendarBlankIcon,
    permissions: [
      Permission.APPOINTMENTS_CREATE,
      Permission.APPOINTMENTS_UPDATE,
    ],
    enabled: true,
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
  [routes.home]: {
    title: "Início",
    breadcrumbs: [{ label: "Início" }],
  },
  [routes.users]: {
    title: "Equipe",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Equipe" },
    ],
  },
  [routes.settings]: {
    title: "Configurações",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações" },
    ],
  },
  [routes.patients]: {
    title: "Pacientes",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Pacientes" },
    ],
  },
  [routes.professionals]: {
    title: "Profissionais",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Profissionais" },
    ],
  },
  [routes.appointments]: {
    title: "Agendamentos",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Agendamentos" },
    ],
  },
}

const DEFAULT_PAGE_META: PageMeta = {
  title: "sclinic",
  breadcrumbs: [{ label: "Início", href: routes.home }],
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

function findNavItem(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS.find((item) => item.href === pathname)
  if (exact) return exact

  return NAV_ITEMS.find(
    (item) =>
      item.href !== routes.home &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  )
}

/**
 * Whether the granted permissions allow the current dashboard path.
 * Paths without a nav entry (or without required permissions) are allowed.
 */
export function canAccessPath(
  pathname: string,
  granted: readonly PermissionKey[],
): boolean {
  const item = findNavItem(pathname)
  if (!item?.permissions || item.permissions.length === 0) return true
  return hasAnyPermission(granted, item.permissions)
}
