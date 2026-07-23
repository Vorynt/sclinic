import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { Permission } from "@/config/permissions"
import { routes } from "@/config/routes"
import { canAccessPath } from "@/modules/dashboard/constants/nav"

describe("canAccessPath", () => {
  it("allows dashboard for any granted set", () => {
    assert.equal(canAccessPath(routes.dashboard, []), true)
  })

  it("allows path when role has required permission", () => {
    assert.equal(
      canAccessPath(routes.patients, [Permission.PATIENTS_READ]),
      true,
    )
  })

  it("denies path when role lacks required permission", () => {
    assert.equal(
      canAccessPath(routes.professionals, [Permission.PATIENTS_READ]),
      false,
    )
  })

  it("matches nested paths against the parent nav item", () => {
    assert.equal(
      canAccessPath(`${routes.users}/invite`, [Permission.MEMBERS_INVITE]),
      true,
    )
    assert.equal(canAccessPath(`${routes.users}/invite`, []), false)
  })

  it("allows unknown paths (no nav permission gate)", () => {
    assert.equal(canAccessPath("/unknown-page", []), true)
  })
})
