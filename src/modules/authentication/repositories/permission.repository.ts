import { eq } from "drizzle-orm"

import { db } from "@/db"
import { permissions, rolePermissions } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { toPermissionKeys } from "@/modules/authentication/mappers/auth.mapper"
import type { PermissionKey } from "@/config/permissions"

export const permissionRepository = {
  async listKeysByRoleId(roleId: string): Promise<PermissionKey[]> {
    return withDbError(async () => {
      const rows = await db
        .select({ key: permissions.key })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(permissions.id, rolePermissions.permissionId),
        )
        .where(eq(rolePermissions.roleId, roleId))

      return toPermissionKeys(rows.map((row) => row.key))
    })
  },
}
