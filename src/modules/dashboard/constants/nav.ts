import type { Icon } from "@phosphor-icons/react";
import {
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  GearIcon,
  HouseIcon,
  QuestionIcon,
  StethoscopeIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

import type { PermissionKey } from "@/config/permissions";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { hasAnyPermission } from "@/core/permissions";

export type NavItem = {
  title: string;
  href: string;
  icon: Icon;
  /** When set, user must have at least one of these permissions. */
  permissions?: PermissionKey[];
  /** Hidden until the module page exists. */
  enabled: boolean;
  /** Nested links (rendered as SidebarMenuSub when present and visible). */
  children?: NavItem[];
};

export type NavGroup = {
  id: string;
  label: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: NavItem[];
};

export type NavConfig = {
  primary: NavItem[];
  groups: NavGroup[];
  secondary: NavItem[];
};

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

export type PageMeta = {
  title: string;
  breadcrumbs: BreadcrumbSegment[];
};

export const NAV_CONFIG: NavConfig = {
  primary: [
    {
      title: "Início",
      href: routes.home,
      icon: HouseIcon,
      enabled: true,
    },
  ],
  groups: [
    {
      id: "operation",
      label: "Operação",
      collapsible: true,
      defaultOpen: true,
      items: [
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
      ],
    },
    {
      id: "management",
      label: "Gestão",
      collapsible: true,
      defaultOpen: true,
      items: [
        {
          title: "Faturamento",
          href: routes.billing,
          icon: CurrencyCircleDollarIcon,
          permissions: [Permission.FINANCIAL_VIEW],
          enabled: true,
        },
        {
          title: "Equipe",
          href: routes.users,
          icon: UsersThreeIcon,
          permissions: [Permission.MEMBERS_INVITE],
          enabled: true,
        },
      ],
    },
  ],
  secondary: [
    {
      title: "Configurações",
      href: routes.settings,
      icon: GearIcon,
      permissions: [Permission.SETTINGS_MANAGE],
      enabled: true,
    },
    {
      title: "Ajuda",
      href: routes.help,
      icon: QuestionIcon,
      enabled: true,
    },
  ],
};

const PAGE_META: Record<string, PageMeta> = {
  [routes.home]: {
    title: "Início",
    breadcrumbs: [{ label: "Início" }],
  },
  [routes.users]: {
    title: "Equipe",
    breadcrumbs: [{ label: "Início", href: routes.home }, { label: "Equipe" }],
  },
  [routes.account]: {
    title: "Minha conta",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Minha conta" },
    ],
  },
  [routes.accountOverview]: {
    title: "Visão geral",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Minha conta", href: routes.accountOverview },
      { label: "Visão geral" },
    ],
  },
  [routes.accountProfile]: {
    title: "Dados pessoais",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Minha conta", href: routes.accountOverview },
      { label: "Dados pessoais" },
    ],
  },
  [routes.accountSecurity]: {
    title: "Segurança",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Minha conta", href: routes.accountOverview },
      { label: "Segurança" },
    ],
  },
  [routes.settings]: {
    title: "Configurações",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações" },
    ],
  },
  [routes.settingsGeneral]: {
    title: "Geral",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações", href: routes.settingsGeneral },
      { label: "Geral" },
    ],
  },
  [routes.settingsHours]: {
    title: "Horários",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações", href: routes.settingsGeneral },
      { label: "Horários" },
    ],
  },
  [routes.settingsServices]: {
    title: "Serviços",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações", href: routes.settingsGeneral },
      { label: "Serviços" },
    ],
  },
  [routes.settingsUsage]: {
    title: "Uso do plano",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações", href: routes.settingsGeneral },
      { label: "Uso do plano" },
    ],
  },
  [routes.settingsDanger]: {
    title: "Zona de perigo",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Configurações", href: routes.settingsGeneral },
      { label: "Zona de perigo" },
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
  [routes.billing]: {
    title: "Faturamento",
    breadcrumbs: [
      { label: "Início", href: routes.home },
      { label: "Faturamento" },
    ],
  },
  [routes.help]: {
    title: "Ajuda",
    breadcrumbs: [{ label: "Início", href: routes.home }, { label: "Ajuda" }],
  },
};

const DEFAULT_PAGE_META: PageMeta = {
  title: "sclinic",
  breadcrumbs: [{ label: "Início", href: routes.home }],
};

function isItemVisible(
  item: NavItem,
  canAny: (...permissions: PermissionKey[]) => boolean,
): boolean {
  if (!item.enabled) return false;
  if (!item.permissions || item.permissions.length === 0) return true;
  return canAny(...item.permissions);
}

/** Recursively keep enabled items the user can access; prune empty children. */
export function filterVisibleItems(
  items: NavItem[],
  canAny: (...permissions: PermissionKey[]) => boolean,
): NavItem[] {
  return items.flatMap((item) => {
    if (!isItemVisible(item, canAny)) return [];

    const children = item.children
      ? filterVisibleItems(item.children, canAny)
      : undefined;

    return [
      {
        ...item,
        ...(children && children.length > 0
          ? { children }
          : { children: undefined }),
      },
    ];
  });
}

export function getVisibleNavConfig(
  canAny: (...permissions: PermissionKey[]) => boolean,
): NavConfig {
  return {
    primary: filterVisibleItems(NAV_CONFIG.primary, canAny),
    groups: NAV_CONFIG.groups
      .map((group) => ({
        ...group,
        items: filterVisibleItems(group.items, canAny),
      }))
      .filter((group) => group.items.length > 0),
    secondary: filterVisibleItems(NAV_CONFIG.secondary, canAny),
  };
}

function flattenNavItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavItems(item.children) : []),
  ]);
}

function allNavItems(): NavItem[] {
  return [
    ...flattenNavItems(NAV_CONFIG.primary),
    ...NAV_CONFIG.groups.flatMap((group) => flattenNavItems(group.items)),
    ...flattenNavItems(NAV_CONFIG.secondary),
  ];
}

export function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) {
    return PAGE_META[pathname];
  }

  const match = Object.entries(PAGE_META).find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return match?.[1] ?? DEFAULT_PAGE_META;
}

function findNavItem(pathname: string): NavItem | undefined {
  const items = allNavItems();
  const exact = items.find((item) => item.href === pathname);
  if (exact) return exact;

  return items.find(
    (item) =>
      item.href !== routes.home &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
}

/**
 * Whether the granted permissions allow the current dashboard path.
 * Paths without a nav entry (or without required permissions) are allowed.
 */
export function canAccessPath(
  pathname: string,
  granted: readonly PermissionKey[],
): boolean {
  const item = findNavItem(pathname);
  if (!item?.permissions || item.permissions.length === 0) return true;
  return hasAnyPermission(granted, item.permissions);
}
