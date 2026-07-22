import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import { roles } from "@/db/schema"
import { withDbError } from "@/db/with-db-error"
import { ASSIGNABLE_ROLE_KEYS } from "@/modules/users/constants/users"
import { toAssignableRole } from "@/modules/users/mappers/invitation.mapper"
import type { AssignableRole } from "@/modules/users/types/invitation"

export const roleRepository = {
  async listAssignable(): Promise<AssignableRole[]> {
    return withDbError(async () => {
      const rows = await db
        .select({
          id: roles.id,
          key: roles.key,
          name: roles.name,
          description: roles.description,
        })
        .from(roles)
        .where(
          and(
            eq(roles.isSystem, true),
            isNull(roles.clinicId),
            isNull(roles.deletedAt),
            inArray(roles.key, [...ASSIGNABLE_ROLE_KEYS]),
          ),
        )

      return rows.map(toAssignableRole)
    })
  },

  async findSystemByKey(key: string): Promise<AssignableRole | null> {
    return withDbError(async () => {
      const [row] = await db
        .select({
          id: roles.id,
          key: roles.key,
          name: roles.name,
          description: roles.description,
        })
        .from(roles)
        .where(
          and(
            eq(roles.key, key),
            eq(roles.isSystem, true),
            isNull(roles.clinicId),
            isNull(roles.deletedAt),
          ),
        )
        .limit(1)

      return row ? toAssignableRole(row) : null
    })
  },
}
