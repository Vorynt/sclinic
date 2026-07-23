import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import type { PermissionKey } from "@/config/permissions"
import { routes } from "@/config/routes"
import { checkPermission } from "@/modules/authentication/permissions/check-permission"

type PermissionProviderProps = {
  children: ReactNode
  /** Single permission shortcut. */
  permission?: PermissionKey
  /** One or more permissions (used with `mode`). */
  permissions?: PermissionKey[]
  /** `all` = every permission; `any` = at least one. Default: `all`. */
  mode?: "all" | "any"
  /** Rendered when the user is authenticated but lacks permission (or clinic). */
  fallback: ReactNode
  /**
   * Rendered when there is no session.
   * If omitted, redirects to the login route.
   */
  unauthenticatedFallback?: ReactNode
}

function resolveRequired(
  permission: PermissionKey | undefined,
  permissions: PermissionKey[] | undefined,
): PermissionKey[] {
  if (permissions && permissions.length > 0) return permissions
  if (permission) return [permission]
  return []
}

/**
 * Server layout gate: declare required permission(s) + fallback.
 *
 * @example
 * ```tsx
 * // app/(dashboard)/patients/page.tsx
 * export default function PatientsPage() {
 *   return (
 *     <PermissionProvider
 *       permission={Permission.PATIENTS_READ}
 *       fallback={<ForbiddenBlock />}
 *     >
 *       {children}
 *     </PermissionProvider>
 *   )
 * }
 * ```
 */
export async function PermissionProvider({
  children,
  permission,
  permissions,
  mode = "all",
  fallback,
  unauthenticatedFallback,
}: PermissionProviderProps) {
  const required = resolveRequired(permission, permissions)
  const result = await checkPermission(
    { headers: await headers() },
    required,
    mode,
  )

  if (!result.ok && result.reason === "unauthenticated") {
    if (unauthenticatedFallback !== undefined) {
      return unauthenticatedFallback
    }
    redirect(routes.login)
  }

  if (!result.ok) {
    return fallback
  }

  return children
}
